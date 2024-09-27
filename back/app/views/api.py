from app.models import Game_Pong

from rest_framework.decorators import api_view
from rest_framework.response import Response

import sys # Pour afficher des messages d'erreur dans la console

@api_view(['POST'])
def initialize_game(request):
    """
    API endpoint to initialize a new Pong game.
    """

    game_id = request.data.get('game_id', None)
    print("[API] game_id : ", game_id, file=sys.stderr)
    game = Game_Pong.objects.get(id=game_id)

    return Response({'dx': game.data.ball_dx, 'dy': game.data.ball_dy})