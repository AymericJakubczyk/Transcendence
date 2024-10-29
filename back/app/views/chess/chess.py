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

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)

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
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chessFoundGame.html', 'user':request.user})
    return render(request, 'chessFoundGame.html', {'user':request.user})

def chessGameView(request, gameID):
    game = get_object_or_404(Game_Chess, id=gameID)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chess.html', 'user':request.user, 'game':game})
    return render(request, 'chess.html', {'user':request.user, 'game':game})
