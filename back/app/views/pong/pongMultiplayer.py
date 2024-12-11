from django.shortcuts import render, redirect, get_object_or_404
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess, Game_Pong, Game_PongMulti
from django.urls import reverse as get_url
from django.db.models import Q
import json, math
from django.http import JsonResponse, HttpResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from app.consumers.pongTournamentConsumer import pongTournamentConsumer

import sys
import logging
from django.contrib import messages

multi_list_waiter = []
all_games_playerlist = {}

def pongFoundMultiView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    global all_games_playerlist
    import app.consumers.utils.multi_utils as multi_utils
    import app.consumers.utils.user_utils as user_utils

    maxNbPlayers = 4
    if request.user in multi_list_waiter:
        print(request.user.username, "is already in multi queue.", file=sys.stderr)
    elif len(multi_list_waiter) < maxNbPlayers - 1:
        multi_list_waiter.append(request.user)
        request.user.game_status_txt = "🕒Waiting..."
        request.user.game_status_url = "/game/pong/ranked/"
        request.user.save()
        print(request.user.username, "is waiting for multi game.", len(multi_list_waiter), "waiting...", file=sys.stderr)

    elif len(multi_list_waiter) == maxNbPlayers - 1:
        multi_list_waiter.append(request.user)

        game = Game_PongMulti()
        game.save()
        for i in range(maxNbPlayers):
            game.playerlist.add(multi_list_waiter[i])
        game.save()
        all_games_playerlist[game.id] = multi_list_waiter.copy()
        print("MultiGame created:", game.id, file=sys.stderr)

        channel_layer = get_channel_layer()

        for user in multi_list_waiter:
            if user == request.user:
                continue
            async_to_sync(channel_layer.group_send)(
                user.username,
                {
                    'type': 'send_ws',
                    'type2': 'match_found',
                    'game_type': 'multi',
                    'game_id': game.id
                }
            )

        for user in multi_list_waiter:
            user.state = User.State.INGAME
            user.game_status_txt = "👥in game..."
            user.game_status_url = "/game/pong/multiplayer/" + str(game.id) + "/"
            user.save()
            user_utils.send_change_state(user)

        multi_list_waiter.clear()
        multi_utils.launch_multi_game(game.id, all_games_playerlist[game.id])
        game.status = "started"
        game.save()
        print("MultiGame launched:", game.id, file=sys.stderr)
        return redirect('pong_multiplayer', gameID=game.id)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'waiting_game.html', 'user':request.user, 'game':'pong_multi'})
    return render(request, 'waiting_game.html', {'user':request.user, 'game':'pong_multi'})


def pongMultiplayer(request, gameID):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    global all_games_playerlist

    game = get_object_or_404(Game_PongMulti, id=gameID)

    if request.user not in game.playerlist.all():
        messages.error(request, 'Multiplayer spectator not implemented.')
        return redirect('pong')

    nbPlayers = game.playerlist.count()
    ingameID = 0
    for user in all_games_playerlist[gameID]:
        if request.user == user:
            print("IN GAME ID", ingameID, "GIVEN", file=sys.stderr)
            break
        ingameID += 1

    data = {
        'gameID': gameID,
        'nbPlayers': nbPlayers,
        'ingameID': ingameID
    }

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongMultiplayer.html', 'user':request.user, 'game':game, 'data':data})
    return render(request, 'pongMultiplayer.html', {'user':request.user, 'game':game, 'data':data})

def pongMultiCancelQueue(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    print("[LOG] User cancel pong queue", file=sys.stderr)
    if request.user in multi_list_waiter:
        multi_list_waiter.remove(request.user)
        request.user.game_status_txt = "Game"
        request.user.game_status_url = "/game/"
        request.user.save()
    return redirect('game')

