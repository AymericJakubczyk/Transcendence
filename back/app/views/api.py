from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess
from django.urls import reverse as get_url
from django.db.models import Q
import json
from django.http import JsonResponse, HttpResponse

import logging
from django.contrib import messages
from app.models import Game_Pong

from rest_framework.decorators import api_view
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import sys # Pour afficher des messages d'erreur dans la console


logger = logging.getLogger(__name__)

@api_view(['POST'])
def initialize_gam(request):
    """
    API endpoint to initialize a new Pong game.
    """

    game_id = request.data.get('game_id', None)
    print("[API] game_id : ", game_id, file=sys.stderr)
    game = Game_Pong.objects.get(id=game_id)

    return Response({'dx': game.data.ball_dx, 'dy': game.data.ball_dy})


@api_view(['POST'])
def initialize_game(request):
    """
    API endpoint to initialize a new Pong game.
    """

    # On récupère les joueurs depuis la requête (ou les valeurs par défaut pour tester)
    player1 = request.user
    player2_id = request.data.get('player2_id', None)
    arena_height = request.data.get('arena_height')
    arena_width = request.data.get('arena_width')
    
    if player2_id:
        player2 = User.objects.get(id=player2_id)
    else:
        player2 = None  # Si un adversaire n'est pas encore assigné

    # Création d'une nouvelle instance de Pong (pour stocker les mouvements du jeu)
    pong_instance = Pong.objects.create(
        ball_x=arena_width / 2, ball_y=arena_height / 2, ball_dx=2, ball_dy=2,
        paddle1_y=arena_height / 2, paddle2_y=arena_height / 2
    )
    
    # Création d'une nouvelle partie
    new_game = Game.objects.create(
        player1=player1,
        player2=player2,
        player1_score=0,
        player2_score=0,
        arena_height=arena_height,
        arena_width=arena_width,
        status='playing',  # Le jeu n'a pas encore commencé
        gametype='PONG',
        pong=pong_instance  # Lien vers l'instance de Pong
    )
    
    # Sérialisation de la partie
    serializer = GameSerializer(new_game)
    
    return Response(serializer.data)



@api_view(['POST'])
def move_paddle(request):
    # print("[API] move_paddle", file=sys.stderr)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "ranked_pong_" + request.data.get('game_id', None),
        {
            "type": "update_paddle",
            "move": request.data.get('move', None),
            "player": request.data.get('player', None)
        }
    )

    return Response({'move', 'ok'})