import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from .utils import pong_utils

import sys #for print

class PongAIConsumer(AsyncWebsocketConsumer):
    player1 = None

    async def connect(self):
        print("[CONNECT PONG AI]", self.scope["user"], file=sys.stderr)
        self.room_group_name = f"ai_pong_{self.scope['user'].username}"
        
        # Le joueur humain est toujours "player1"
        self.player1 = self.scope["user"]
        
        # Ajouter ce consumer à un groupe de WebSocket
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print("[DISCONNECT PONG AI]", self.scope["user"], self.room_group_name, file=sys.stderr)
        
        # Retirer ce consumer du groupe de WebSocket
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("[RECEIVE PONG AI]", text_data_json, file=sys.stderr)

        if text_data_json['type'] == 'move_paddle':
            # Gérer le mouvement de la raquette du joueur humain
            await pong_utils.move_paddle(
                text_data_json['move'],
                text_data_json['pressed'],
                player=1,  # Player 1 est le joueur humain
                game_id=None  # Pas d'ID de jeu pour l'IA locale
            )
        
        # Simuler une réponse de l'IA ici
        await self.simulate_ai_response()

    async def simulate_ai_response(self):
        """Simule les actions de l'IA (par exemple, suivre la balle)."""
        print("[AI RESPONSE] Simulating AI paddle movement", file=sys.stderr)
        ai_action = {
            "type": "move_paddle",
            "move": "down",  # Exemple : l'IA bouge sa raquette vers le bas
            "pressed": True
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_update",
                "ai_action": ai_action
            }
        )

    # ======================== SENDER ======================== #
    async def game_update(self, event):
        """Envoie des mises à jour de jeu au client."""
        await self.send(text_data=json.dumps(event))

    async def end_game(self, event):
        """Gère la fin du jeu."""
        await self.send(text_data=json.dumps(event))

    async def countdown(self, event):
        """Gère le décompte avant le début du jeu."""
        await self.send(text_data=json.dumps(event))
