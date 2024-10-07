from app.models import Game_Pong

from rest_framework.decorators import api_view
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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