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

def ranking(user):
    return (user.pong_rank)

def match_place(game):
    return (game.tournament_pos)

def seedPlayers(playerlist):
    print("Starting seeding...", file=sys.stderr)
    seededPlayers = []
    for player in playerlist:
        seededPlayers.append(player)
    
    seededPlayers.sort(reverse=True, key=ranking)
    print("Players seeded :", file=sys.stderr)
    n = 0
    for player in seededPlayers:
        print("\tseed", n, player, player.pong_rank, file=sys.stderr)
        n = n + 1
    return (seededPlayers)


# 1
#           2
# 3
#       4
# 5
#       6
# 7
#       8
# 9
#           10

def makematchs(playerlist, number, tournament):

    half = math.ceil(number / 2)
    nbmatch = 1
    while pow(2, nbmatch) < half:
        nbmatch+= 1
    nbmatch = pow(2, nbmatch)
    tournament.matchspertree = math.ceil(nbmatch / 2)
    tournament.save()
    print("Players:", number, "Nb match 1er round:", nbmatch, file=sys.stderr)
    while (len(playerlist) != nbmatch * 2):
        playerlist.append(None)
    print("None players added.", file=sys.stderr)
    first = playerlist[:nbmatch]
    second = playerlist[nbmatch:]

    matchs = []
    i = 1
    y = 1
    while (len(matchs) != nbmatch):
        newGame = Game_Pong()

        if (len(first) != 0 and first[0] != None):
            newGame.player1 = first[0]
        first.pop(0)

        if (len(second) != 0 and second[-1] != None):
            newGame.player2 = second[-1]
        second.pop(-1)

        if (len(matchs) % 2 == 0):
            newGame.tournament_pos = int(i)
            i += 1
        else :
            newGame.tournament_pos = math.ceil((nbmatch / 2) + y)
            y += 1
        newGame.save()
        matchs.append(newGame)

    matchs.sort(reverse=False, key=match_place)

    for game in matchs:
        print("\tGAME ID:", game.id, "- R1", game.tournament_pos, "- MATCH :", game.player1, "VS", game.player2, file=sys.stderr)
        if (game.tournament_pos == math.ceil(nbmatch / 2)):
            print("\t-------------------", file=sys.stderr)
        if not game.player2:
            game.winner = game.player1
            game.save()

    return matchs

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

        print("Tournament Players:", file=sys.stderr)
        for player in tournament.participants.all():
            print("\tPlayer:", player.username, file=sys.stderr)

        playercount = tournament.participants.count()

        # if playercount < 3 display error

        playerlist = seedPlayers(tournament.participants.all())
        tournament_matchs = makematchs(playerlist, playercount, tournament)

        nbmatch = len(tournament_matchs)
        roundcount = 2
        while (nbmatch > 1):
            i = math.ceil(nbmatch / 2)
            while (i > 0):
                newGame = Game_Pong()
                newGame.tournament_round = roundcount
                newGame.tournament_pos = roundcount * 100 + i
                newGame.save()
                print("Game created:", newGame.tournament_round, "round,", newGame.tournament_pos, "pos.", file=sys.stderr)
                tournament_matchs.append(newGame)
                i-= 1
            roundcount += 1
            nbmatch = math.ceil(nbmatch / 2)

        tournament.pong_matchs.set(tournament_matchs)
        tournament.started = True
        tournament.save()


    if 'update_tournament' in request.POST:
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
            if (request.user == tournament.host_user and tournament.participants.count() > 0):
                tournament.host_user = tournament.participants.all()[0]
                print("NEW HOST IS :", tournament.host_user, file=sys.stderr)
            tournament.save()
            if (tournament.participants.count() == 0):
                tournament.delete()

    if request.user.tournament_id != -1:
        mytournament = Tournament.objects.get(id=request.user.tournament_id)
    else:
        mytournament = None


    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongTournament.html', 'user':request.user, 'all_tournaments': all_tournaments, 'mytournament': mytournament})
    return render(request, 'pongTournament.html', {'user':request.user, 'all_tournaments': all_tournaments, 'mytournament': mytournament})

