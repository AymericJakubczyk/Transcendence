from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess, Game_Pong
from django.urls import reverse as get_url
from django.db.models import Q
import json, math
from django.http import JsonResponse, HttpResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import app.consumers.utils.pong_utils as pong_utils
from app.consumers.pongAIConsumer import PongAIConsumer

import sys
import logging
from django.contrib import messages

def pongAISetup(request):
    import app.consumers.utils.pong_utils as pong_utils
    import app.consumers.utils.user_utils as user_utils

    game = Game_Pong()
    game.player2 = request.user
    # get user root for ia
    game.player1 = User.objects.get(username="root")
    game.save()
    print("Game created:", game.id, file=sys.stderr)
    pong_utils.launch_ai_game(game.id)
    game.status = "started"
    game.save()
    request.user.state = User.State.INGAME
    request.user.game_status_txt = "🏓in game..."
    user_utils.send_change_state(request.user)
    print("Game launched:", game.id, file=sys.stderr)
    return redirect('pong_ai', gameID=game.id)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong_ai.html', 'user':request.user})
    return render(request, 'pong_ai.html', {'user':request.user})

def pongAIGame(request, gameID):
    import app.consumers.utils.pong_utils as pong_utils
    game = get_object_or_404(Game_Pong, id=gameID)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong_ranked.html', 'user':request.user, 'game':game, 'gameID':gameID})
    return render(request, 'pong_ranked.html', {'user':request.user, 'game':game, 'gameID':gameID})
