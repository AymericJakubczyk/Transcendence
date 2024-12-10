from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess, Game_Pong
from app.views.web3.sepoliaTournament import createTournament, get_participants_arr
from django.urls import reverse as get_url
from django.db.models import Q
import json, math
from django.http import JsonResponse, HttpResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
import threading
import app.consumers.utils.pong_utils as pong_utils

from app.consumers.pongTournamentConsumer import pongTournamentConsumer

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)


list_waiter = []


def pongModeView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongMode.html', 'user':request.user})
    return render(request, 'pongMode.html', {'user':request.user})

def ranking(user):
    return (user.pong_rank)

def match_place(game):
    return (game.tournament_pos)

def seedPlayers(playerlist):
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

def updateTournamentRoom(tournament_id):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "pong_tournament_" + str(tournament_id),
        {
            "type": "update_room",
        }
    )


def moveWinners(tournament_matchs):
    for game in tournament_matchs:
        if (game.winner):
            if (game.tournament_pos % 2 == 1):
                new_game_pos = game.tournament_pos // 100 * 100 + 100 + (game.tournament_pos % 100 + 1) // 2
            else :
                new_game_pos = game.tournament_pos // 100 * 100 + 100 + game.tournament_pos % 100 // 2

            for game_obj in tournament_matchs:
                if (game_obj.tournament_pos == new_game_pos):
                    if (not game_obj.player1):
                        game_obj.player1 = game.winner
                    elif (not game_obj.player2):
                        game_obj.player2 = game.winner
                        # send ws tournament game ready
                        pong_utils.pong_tournament_game_ready(game_obj)
                    game_obj.save()
    return tournament_matchs



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
    i = 101
    y = 101
    while (len(matchs) != nbmatch):
        newGame = Game_Pong()
        newGame.tournament_id = tournament.id

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
        if (newGame.player1 != None and newGame.player2 != None):
            pong_utils.pong_tournament_game_ready(newGame)
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
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    all_tournaments = Tournament.objects.filter(game_played="PONG")

    if 'create_tournament' in request.POST:
        game_played = "PONG"
        max_users = request.POST.get('group-size')
        if request.POST.get('tournament_name') == "":
            name = request.user.username + "'s tournament"
        else :
            name = request.POST.get('tournament_name')
        if game_played and len(request.POST.get('tournament_name')) < 26:
            tournament = Tournament()
            tournament.host_user = request.user
            tournament.max_users = max_users
            tournament.name = name
            tournament.save()
            tournament.participants.add(request.user)
            tournament.save()
            request.user.tournament_id = tournament.id
            request.user.save()

    if 'bracket_tournament' in request.POST:
        tournament_id = request.POST.get('bracket_tournament')
        tournament = get_object_or_404(Tournament, id=tournament_id)
        for user in tournament.participants.all():
            tournament.has_participate.add(user)
        playercount = tournament.participants.count()
        if playercount > 2:
            #CREATE TOURNAMENT ON BLOCKCHAIN
            playerlist = get_participants_arr(tournament)
            thread = threading.Thread(target=createTournament, args=(playerlist, int(tournament_id), tournament.name))
            thread.start()

            #seed the players
            playerlist = seedPlayers(tournament.participants.all())
            # create and fill matchs for first round
            tournament_matchs = makematchs(playerlist, playercount, tournament)

            # create and fill matchs for the other rounds
            nbmatch = len(tournament_matchs)
            roundcount = 2
            while (nbmatch > 1):
                i = math.ceil(nbmatch / 2)
                while (i > 0):
                    newGame = Game_Pong()
                    newGame.tournament_round = roundcount
                    newGame.tournament_pos = roundcount * 100 + i
                    newGame.tournament_id = tournament.id
                    newGame.save()
                    print("Game created:", newGame.tournament_round, "round,", newGame.tournament_pos, "pos.", file=sys.stderr)
                    tournament_matchs.append(newGame)
                    i-= 1
                roundcount += 1
                nbmatch = math.ceil(nbmatch / 2)

            tournament_matchs = moveWinners(tournament_matchs)
            tournament.pong_matchs.set(tournament_matchs)
            tournament.started = True
            tournament.save()
            updateTournamentRoom(tournament.id)

    if 'join_tournament' in request.POST:
        tournament_id = request.POST.get('join_tournament')
        tournament = get_object_or_404(Tournament, id=tournament_id)
        if request.user not in tournament.participants.all():
            request.user.tournament_id = tournament.id
            tournament.participants.add(request.user)
            request.user.save()
            tournament.save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "pong_tournament_" + str(tournament_id),
                {
                    'type': 'refresh_infos',
                    'action': 'join',
                    'user_username': request.user.username,
                    'user_rank': request.user.pong_rank,
                    'tournamentName': tournament.name,
                    'profile_pic' : request.user.profile_picture.url,
                    'tournamentNB': tournament.participants.count()
                }
            )

    if 'leave_tournament' in request.POST:
        tournament_id = request.POST.get('leave_tournament')
        tournament = get_object_or_404(Tournament, id=tournament_id)
        if request.user in tournament.participants.all():
            tournament.participants.remove(request.user)
            request.user.tournament_id = -1
            request.user.save()
            if (request.user == tournament.host_user and tournament.participants.count() > 0 and tournament.started == False):
                tournament.host_user = tournament.participants.all()[0]
                print("NEW HOST IS :", tournament.host_user, file=sys.stderr)
            tournament.save()

            if (tournament.participants.count() == 0 and tournament.started == False):
                tournament.delete()
            else :
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "pong_tournament_" + str(tournament_id),
                    {
                        'type': 'refresh_infos',
                        'action': 'leave',
                        'user_username': request.user.username,
                        'user_rank': request.user.pong_rank,
                        'tournamentName': tournament.name,
                        'tournamentNB': tournament.participants.count()
                    }
                )

    if request.user.tournament_id != -1:
        mytournament = get_object_or_404(Tournament, id=request.user.tournament_id)
    else:
        mytournament = None

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pongTournament.html', 'user':request.user, 'all_tournaments': all_tournaments, 'mytournament': mytournament})
    return render(request, 'pongTournament.html', {'user':request.user, 'all_tournaments': all_tournaments, 'mytournament': mytournament})

def pongLocalView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong.html', 'user':request.user})
    return render(request, 'pong.html', {'user':request.user})


def pongView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong_local.html', 'user':request.user})
    return render(request, 'pong_local.html', {'user':request.user})


def pongFoundGameView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    import app.consumers.utils.pong_utils as pong_utils
    import app.consumers.utils.user_utils as user_utils

    if request.user in list_waiter:
        print("User already in list_waiter", file=sys.stderr)
    # if list_waiter length is zero, add user to list_waiter
    elif len(list_waiter) == 0:
        list_waiter.append(request.user)
        request.user.game_status_txt = "🕒Waiting..."
        request.user.game_status_url = "/game/pong/ranked/"
        request.user.save()
    # else remove user from list_waiter, create game redirect to game, and send match_found to wainting user
    else:
        opponent = list_waiter[0]
        list_waiter.pop(0)
        game = Game_Pong()
        game.player1 = opponent
        game.player2 = request.user
        game.save()
        print("Game created:", game.id, file=sys.stderr)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            opponent.username,
            {
                'type': 'send_ws',
                'type2': 'match_found',
                'game_type': 'pong',
                'game_id': game.id
            }
        )
        pong_utils.launch_game(game.id)
        game.status = "started"
        game.save()

        # PASS USER IN GAME STATUT
        opponent.state = User.State.INGAME
        opponent.game_status_txt = "🏓in game..."
        opponent.game_status_url = "/game/pong/ranked/" + str(game.id) + "/"
        opponent.save()
        request.user.state = User.State.INGAME
        request.user.game_status_txt = "🏓in game..."
        request.user.game_status_url = "/game/pong/ranked/" + str(game.id) + "/"
        request.user.save()
        user_utils.send_change_state(opponent)
        user_utils.send_change_state(request.user)

        print("Game launched:", game.id, file=sys.stderr)
        return redirect('pong_game', gameID=game.id)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'waiting_game.html', 'user':request.user, 'game':'pong'})
    return render(request, 'waiting_game.html', {'user':request.user, 'game':'pong'})


def pongGameView(request, gameID):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    import app.consumers.utils.pong_utils as pong_utils

    game = get_object_or_404(Game_Pong, id=gameID)
    if (game.tournament_pos != -1 ):
        # need to add more secure to check which player is joining the game (because if you refresh page while you wait for opponent, you launch the game alone)
        
        tournament = get_object_or_404(Tournament, id=game.tournament_id)
        if (game.player1 not in tournament.participants.all() or game.player2 not in tournament.participants.all()):
            game.status = "started"
            if (game.player1 not in tournament.participants.all()):
                game.winner = game.player2
            if (game.player2 not in tournament.participants.all()):
                game.winner = game.player1
            game.save()
            print(game.winner,"won game", game.id, "by forfeit", file=sys.stderr)
            pong_utils.leave_update(game.id)
            return redirect('pong_tournament')

        if (game.opponent_ready and game.status == "waiting"):
            pong_utils.launch_game(game.id)
            game.status = "started"
            game.save()
            # update for put spectate btn in real time but don't work
            # updateTournamentRoom(game.tournament_id)
            print("Game launched:", game.id, file=sys.stderr)
        else :
            game.opponent_ready = request.user
            game.save()

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong_ranked.html', 'user':request.user, 'game':game, 'gameID':gameID})
    return render(request, 'pong_ranked.html', {'user':request.user, 'game':game, 'gameID':gameID})

def pongCancelQueue(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    print("[LOG] User cancel pong queue", file=sys.stderr)
    if request.user in list_waiter:
        list_waiter.remove(request.user)
        request.user.game_status_txt = 'none'
        request.user.game_status_url = 'none'
        request.user.save()
    return redirect('game')


def pongCancelWaitingTournament(request, gameID):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')

    print("[LOG] User cancel pong waiting", file=sys.stderr)

    game = get_object_or_404(Game_Pong, id=gameID)
    if game.opponent_ready == request.user:
        game.opponent_ready = None
        game.save()
    request.user.game_status_txt = 'none'
    request.user.game_status_url = 'none'
    request.user.save()
    return redirect('pong_tournament')