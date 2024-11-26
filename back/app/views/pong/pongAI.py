from django.shortcuts import render, get_object_or_404
from app.models import Game_Pong
import sys



def pongGameAIView(request, gameID):
    import app.consumers.utils.pong_utils as pong_utils

    game = get_object_or_404(Game_Pong, id=gameID)
    if (game.tournament_pos != -1 ):
        # need to add more secure to check which player is joining the game (because if you refresh page while you wait for opponent, you launch the game alone)
        if (game.opponent_ready and game.status == "waiting"):
            pong_utils.launch_game(game.id)
            game.status = "started"
            game.save()
            # update for put spectate btn in real time but don't work
            # updateTournamentRoom(game.tournament_id)
            print("Game launched:", game.id, file=sys.stderr)
        else :
            game.opponent_ready = True
            game.save()

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong_ranked.html', 'user':request.user, 'game':game, 'gameID':gameID})
    return render(request, 'pong_ranked.html', {'user':request.user, 'game':game, 'gameID':gameID})
