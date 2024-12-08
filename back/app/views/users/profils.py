from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess, Game_Pong, Game_PongMulti
from django.urls import reverse as get_url
from django.db.models import Q
import json
from django.http import JsonResponse, HttpResponse
from datetime import datetime
from django.utils.timezone import make_aware

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)

def profilView(request, username):
    user = get_object_or_404(User, username=username)

    all_pong_games_to_order = Game_Pong.objects.filter(Q(player1=user) | Q(player2=user))
    all_pong_games = all_pong_games_to_order.order_by('-updated_at')
    
    all_chess_games_to_order = Game_Chess.objects.filter(Q(white_player=user) | Q(black_player=user))
    all_chess_games = all_chess_games_to_order.order_by('-updated_at')

    all_tournament_to_order = Tournament.objects.filter(participants=user, winner__isnull=False)
    all_tournaments = all_tournament_to_order.order_by('-updated_at')
    print("USER ", user, " username", user.username, file=sys.stderr)
    print(all_tournament_to_order, file=sys.stderr)
    print("HEEEEEEEEEEEEEEEEEEEEERE", file=sys.stderr)
    for tournament in all_tournaments:
        for player in tournament.participants.all():
            print("participants", player, file=sys.stderr)
    now = make_aware(datetime.now())
    if user.last_login:
        delta = now - user.last_login
    context_last_login = {
        'delta': delta,
        'total_seconds': delta.total_seconds() if delta else None,
        'minutes': (delta.total_seconds() / 60) if delta else None,
        'hours': (delta.total_seconds() / 3600) if delta else None,
        'days': delta.days if delta else None,
    }
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'profil.html', 'user':user, 'all_chess_games':all_chess_games, 'all_pong_games':all_pong_games, 'all_tournaments':all_tournaments, 'context_last_login':context_last_login})
    return render(request, 'profil.html', {'user':user, 'all_chess_games':all_chess_games, 'all_pong_games':all_pong_games, 'all_tournaments':all_tournaments, 'context_last_login':context_last_login})

def myProfilView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'You need to log-in !')
        return redirect('home')
    if request.user.is_authenticated:
        all_friend_requests = Friend_Request.objects.filter(to_user=request.user)
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'myprofil.html', 'user':request.user, 'all_friend_requests': all_friend_requests, 'refresh':True})
        return render(request, 'myprofil.html', {'user':request.user, 'all_friend_requests': all_friend_requests, 'refresh':False})

    next_url = get_url('myprofile')
    if (request.GET.get('next')):
        next_url = request.GET.get('next')
    form = LoginForm()

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            print("form valid", file=sys.stderr)
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
            )
            if user is not None:
                print("login", request.user, file=sys.stderr)
                login(request, user)
                return (redirect(next_url))
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'myprofil.html', 'form':form, 'next_url':next_url})
    return render(request, 'myprofil.html', {'form':form, 'next_url':next_url})


@login_required
def updateProfile(request):
    user = request.user
    if request.method == 'POST':
        form = UpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            updated = form.save(commit=False)
            if request.FILES:
                logger.info(f"Files received: {request.FILES}")
            else:
                logger.warning("No files received")
            if not updated.profile_picture :
                updated.profile_picture = 'imgs/profils/creepy-cat.webp'
            updated.save()
            return redirect('myprofile')
        else:
            logger.warning(f"Form errors: {form.errors}")
    else:
        form = UpdateForm(instance=user)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'update_profile.html', 'form':form, 'user':user})
    return render(request, 'update_profile.html', {'form':form, 'user':user})

@login_required
def password_change(request):
    form = PasswordChangeForm(user=request.user)
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            return redirect('myprofile')
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'password_change.html', 'form':form})
    return render(request, 'password_change.html', {'form':form})
