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
    global all_games_playerlist
    import app.consumers.utils.multi_utils as multi_utils

    maxNbPlayers = 3
    if request.user in multi_list_waiter:
        print(request.user.username, "is already in multi queue.", file=sys.stderr)
    # if multi_list_waiter length is zero, add user to multi_list_waiter
    elif len(multi_list_waiter) < maxNbPlayers - 1:
        multi_list_waiter.append(request.user)
        print(request.user.username, "is waiting for multi game.", len(multi_list_waiter), "waiting...", file=sys.stderr)

    # else remove user from multi_list_waiter, create game redirect to game, and send match_found to wainting user
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

        multi_list_waiter.clear()
        multi_utils.launch_multi_game(game.id, all_games_playerlist[game.id])
        game.status = "started"
        game.save()
        print("MultiGame launched:", game.id, file=sys.stderr)
        return redirect('pong_multiplayer', gameID=game.id)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'waiting_game.html', 'user':request.user})
    return render(request, 'waiting_game.html', {'user':request.user})


def pongMultiplayer(request, gameID):
    global all_games_playerlist

    game = get_object_or_404(Game_PongMulti, id=gameID)

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

