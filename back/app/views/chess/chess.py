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

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)
list_waiter = []

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
    # if list_waiter length is zero, add user to list_waiter
    if len(list_waiter) == 0:
        list_waiter.append(request.user)
    
    # else remove user from list_waiter, create game redirect to game, and send match_found to wainting user
    else:
        opponent = list_waiter[0]
        list_waiter.pop(0)
        game = Game_Chess()

        # random for white player
        if random.random() > 0.5:
            game.white_player = request.user
            game.black_player = opponent
        else:
            game.white_player = opponent
            game.black_player = request.user

        # game.board = []
        # for i in range(8):
        #     game.board.append([])
        #     for j in range(8):
        #         game.board[i].append(chess_class.Cell().toJSON())

        # for i in range(8):
        #     game.board[1][i]['piece'] = chess_class.Pawn('black').toJSON()
        #     game.board[6][i]['piece'] = chess_class.Pawn('white').toJSON()
        
        #     game.board[0][0]['piece'] = game.board[0][7]['piece'] = chess_class.Rook("black").toJSON()
        #     game.board[0][1]['piece'] = game.board[0][6]['piece'] = chess_class.Knight("black").toJSON()
        #     game.board[0][2]['piece'] = game.board[0][5]['piece'] = chess_class.Bishop("black").toJSON()
        #     game.board[0][3]['piece'] = chess_class.Queen("black").toJSON()
        #     game.board[0][4]['piece'] = chess_class.King("black").toJSON()

        #     game.board[7][0]['piece'] = game.board[7][7]['piece'] = chess_class.Rook("white").toJSON()
        #     game.board[7][1]['piece'] = game.board[7][6]['piece'] = chess_class.Knight("white").toJSON()
        #     game.board[7][2]['piece'] = game.board[7][5]['piece'] = chess_class.Bishop("white").toJSON()
        #     game.board[7][3]['piece'] = chess_class.Queen("white").toJSON()
        #     game.board[7][4]['piece'] = chess_class.King("white").toJSON()
        
        game.save()


        chess_utils.launch_game(game.id)

        print("Chess game created:", game.id, file=sys.stderr)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            opponent.username,
            {
                'type': 'send_ws',
                'type2': 'match_found',
                'game_type': 'chess',
                'game_id': game.id
            }
        )
        # chess_utils.launch_game(game.id)
        # game.status = "started"
        # game.save()
        print("Chess game launched:", game.id, file=sys.stderr)
        return redirect('chess_game', gameID=game.id)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'waiting_game.html', 'user':request.user})
    return render(request, 'waiting_game.html', {'user':request.user})

def chessGameView(request, gameID):
    game = get_object_or_404(Game_Chess, id=gameID)
    board = chess_utils.get_board(gameID)
    if not board:
        return redirect('chess')

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chess.html', 'user':request.user, 'game':game, 'board':board})
    return render(request, 'chess.html', {'user':request.user, 'game':game, 'board':board})
