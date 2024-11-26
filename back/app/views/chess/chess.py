from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess
from django.urls import reverse as get_url
from django.db.models import Q
import json
import random
from django.http import JsonResponse, HttpResponse

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import app.consumers.utils.chess_class as chess_class
import app.consumers.utils.chess_utils as chess_utils
import app.consumers.utils.user_utils as user_utils

import sys
import logging
import threading
import time
from django.contrib import messages

logger = logging.getLogger(__name__)
list_waiter = {}

@login_required
def chessView(request):
    user = get_object_or_404(User, id=request.user.id)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chess.html', 'user':user})
    return render(request, 'chess.html', {'user':user})

def chessModeView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chessMode.html', 'user':request.user})
    return render(request, 'chessMode.html', {'user':request.user})

def chessFoundGameView(request):
    if request.user in list_waiter:
        print("User already in list_waiter", file=sys.stderr)
    # if list_waiter length is zero, add user to list_waiter

    elif len(list_waiter) == 0:
        list_waiter[request.user] = 30
        thread = threading.Thread(target=thread_function)
        thread.start()
    # else remove user from list_waiter, create game redirect to game, and send match_found to wainting user
    else:
        list_waiter[request.user] = 30
        request.user.game_status_txt = "🕒Waiting..."
        request.user.game_status_url = "/game/chess/ranked/"
        request.user.save()

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'waiting_game.html', 'user':request.user, 'game':'chess'})
    return render(request, 'waiting_game.html', {'user':request.user, 'game':'chess'})

def chessCancelQueue(request):
    print("[LOG] User cancel chess queue", file=sys.stderr)
    if request.user in list_waiter:
        # list_waiter.remove(request.user)
        del list_waiter[request.user]
        request.user.game_status_txt = "Game"
        request.user.game_status_url = "/game/"
        request.user.save()
    return redirect('game')

def chessGameView(request, gameID):
    game = get_object_or_404(Game_Chess, id=gameID)
    board = chess_utils.get_board(gameID)
    if not board:
        return redirect('chess')

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chess.html', 'user':request.user, 'game':game, 'board':board})
    return render(request, 'chess.html', {'user':request.user, 'game':game, 'board':board})


# ======================= UTILS FOR MATCHMAKING ======================== #

def game_found(user, opponent):
        game = Game_Chess()

        # random for white player
        if random.random() > 0.5:
            game.white_player = user
            game.black_player = opponent
        else:
            game.white_player = opponent
            game.black_player = user

        game.save()
        game.status = "started"
        chess_utils.launch_game(game.id)

        print("Chess game created:", game.id, file=sys.stderr)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            opponent.username, {'type': 'send_ws', 'type2': 'match_found', 'game_type': 'chess', 'game_id': game.id}
        )
        async_to_sync(channel_layer.group_send)(
            user.username, {'type': 'send_ws', 'type2': 'match_found', 'game_type': 'chess', 'game_id': game.id}
        )

        # PASS USER IN GAME STATUT 
        opponent.state = User.State.INGAME
        opponent.game_status_txt = "♟️in game..."
        opponent.game_status_url = "/game/chess/ranked/" + str(game.id) + "/"
        opponent.save()
        user.state = User.State.INGAME
        user.game_status_txt = "♟️in game..."
        user.game_status_url = "/game/chess/ranked/" + str(game.id) + "/"
        user.save()

        user_utils.send_change_state(opponent)
        user_utils.send_change_state(user)

def fond_opponent(user):
    global list_waiter

    cp_list_waiter = dict(list_waiter)
    for opponent in cp_list_waiter:
        if opponent == user:
            continue
        print("Check opponent", user.username, user.chess_rank, opponent.username, opponent.chess_rank, file=sys.stderr)
        if user in cp_list_waiter and opponent.chess_rank >= user.chess_rank - cp_list_waiter[user] and opponent.chess_rank <= user.chess_rank + cp_list_waiter[user]:
            print("IS OK FOR", opponent.username, file=sys.stderr)
            if user.chess_rank >= opponent.chess_rank - cp_list_waiter[opponent]  and user.chess_rank <= opponent.chess_rank + cp_list_waiter[opponent]:
                print("Match found", user.username, opponent.username, file=sys.stderr)
                if user in list_waiter and opponent in list_waiter:
                    del list_waiter[user]
                    del list_waiter[opponent]
                    game_found(user, opponent)
                    break

def thread_function():
    global list_waiter
    
    print("[THREAD] started", file=sys.stderr)
    while True:
        print("[THREAD] running", list_waiter, file=sys.stderr)
        if len(list_waiter) == 0:
            print("[THREAD] stopped", file=sys.stderr)
            break
        print("[LOG]", list_waiter, file=sys.stderr)
        for user in dict(list_waiter):
            fond_opponent(user)
        time.sleep(1)
        for user in dict(list_waiter):
            if list_waiter[user] < 250:
                list_waiter[user] += 5
