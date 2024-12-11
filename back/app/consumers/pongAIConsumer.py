import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from .utils import pong_ai_utils

import sys #for print

class PongAIConsumer(AsyncWebsocketConsumer):
    id = None
    player1 = None
    player2 = None

    async def connect(self):
        print("[CONNECT PONG AI]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_ai_pong"

        if "id" in self.scope["url_route"]["kwargs"]:
            self.id = self.scope["url_route"]["kwargs"]["id"]
            self.player1 = await self.get_player1()
            print("[GAME ID]", self.id, file=sys.stderr)
            self.room_group_name = "ai_pong_" + str(self.id)
        else:
            print("[ERROR] no id", file=sys.stderr)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        import app.consumers.utils.pong_ai_utils as pong_ai_utils 
        print("[DISCONNECT PONG AI]", self.scope["user"], self.room_group_name, file=sys.stderr)
        
        pong_ai_utils.stop_game(int(self.id))

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("[RECEIVE PONG AI]", data, file=sys.stderr)

        player = 0
        if self.scope["user"] == self.player1:
            player = 1
        elif self.scope["user"] == self.player2:
            player = 1
        
        if player == 0:
            print("[ERROR] player not in game", file=sys.stderr)
            return

        if (data.get('type') and data['type'] == 'move_paddle' and data.get('move')):
            await pong_ai_utils.move_paddle(data['move'], data['pressed'], player, int(self.id))

    @database_sync_to_async
    def get_player1(self):
        from app.models import Game_Pong

        game = get_object_or_404(Game_Pong, id=self.id)
        return game.player1


    # ======================== SENDER ======================== #
    async def game_update(self, event):
        """Envoie des mises à jour de jeu au client."""
        await self.send(text_data=json.dumps(event))

    async def bump(self, event):
        await self.send(text_data=json.dumps(event))

    async def end_game(self, event):
        """Gère la fin du jeu."""
        await self.send(text_data=json.dumps(event))

    async def countdown(self, event):
        """Gère le décompte avant le début du jeu."""
        await self.send(text_data=json.dumps(event))
