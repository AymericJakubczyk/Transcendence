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


def pongMultiWait(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongMultiFound.html', 'user':request.user})
    return render(request, 'pongMultiFound.html', {'user':request.user})

def pongMultiplayer(request, gameID):
    game = get_object_or_404(Game_PongMulti, id=gameID)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongMultiplayer.html', 'user':request.user, 'game':game})
    return render(request, 'pongMultiplayer.html', {'user':request.user, 'game':game})

