from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess, Game_Pong
from django.urls import reverse as get_url
from django.db.models import Q
import json
from django.http import JsonResponse, HttpResponse

from app.consumers.pongTournamentConsumer import pongTournamentConsumer

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)



def pongView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong.html', 'user':request.user})
    return render(request, 'pong.html', {'user':request.user})



def pongModeView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongMode.html', 'user':request.user})
    return render(request, 'pongMode.html', {'user':request.user})



def pongTournament(request):
    print("[PONG]", request.POST, file=sys.stderr)
    all_tournaments = Tournament.objects.filter(game_played="PONG")

    if 'create_tournament' in request.POST:
        print("trying to create", file=sys.stderr)
        game_played = "PONG"
        max_users = request.POST.get('group-size')
        if game_played:
            tournament = Tournament()
            tournament.host_user = request.user
            tournament.max_users = max_users
            tournament.save()
            tournament.participants.add(request.user)
            tournament.save()
            request.user.tournament_id = tournament.id
            request.user.save()


    if 'bracket_tournament' in request.POST:
        print("making brackets", file=sys.stderr)
        tournament_id = request.POST.get('bracket_tournament')
        tournament = Tournament.objects.get(id=tournament_id)

        playercount = tournament.participants.count()
        playerlist = tournament.participants.all()

        players = playercount
        rounds = 1
        placed = 0
        # if odd, adapt it
        while placed != players :
            newGame = Game_Pong()
            # seeding
            newGame.player1 = playerlist[placed]
            newGame.player2 = playerlist[placed + 1]
            newGame.tournament = True
            newGame.save()
            placed = placed + 2
            print("GAME ID :", newGame.id, "- ROUND :", rounds, "- MATCH :", newGame.player1, "VS", newGame.player2, file=sys.stderr)
            print("PLACED :", placed, "/", players, file=sys.stderr)


    if 'launch_tournament' in request.POST:
        print("launching tournament", file=sys.stderr)
        # launch games
        # wait results
        # get winners
        # players = winners.count()
        # redo games


    if 'join_tournament' in request.POST:
        print("trying to join", file=sys.stderr)
        tournament_id = request.POST.get('join_tournament')
        tournament = Tournament.objects.get(id=tournament_id)
        if request.user not in tournament.participants.all():
            request.user.tournament_id = tournament.id
            tournament.participants.add(request.user)
            request.user.save()
            tournament.save()

    if 'leave_tournament' in request.POST:
        print("trying to leave", file=sys.stderr)
        tournament_id = request.POST.get('leave_tournament')
        tournament = Tournament.objects.get(id=tournament_id)
        if request.user in tournament.participants.all():
            tournament.participants.remove(request.user)
            request.user.tournament_id = -1
            request.user.save()
            tournament.save()
            if tournament.participants.count() == 0:
                tournament.delete()

    if request.user.tournament_id != -1:
        mytournament = Tournament.objects.get(id=request.user.tournament_id)
    else:
        mytournament = None


    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongTournament.html', 'user':request.user, 'all_tournaments': all_tournaments, 'mytournament': mytournament})
    return render(request, 'pongTournament.html', {'user':request.user, 'all_tournaments': all_tournaments, 'mytournament': mytournament})

