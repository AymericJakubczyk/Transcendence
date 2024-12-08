import json, math
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import random
import asyncio

from .utils import multi_utils

import sys

nbr_waiter = 0
list_waiter = []
playerIDlist = []
all_data = {}


arenaWidth = 100
arenaLength = 150
ringRadius = 50
paddleRadius = ringRadius - 3
ballRadius = 1
paddleWidth = 1
paddleHeight = 17
thickness = 1
baseSpeed = 0.5
nbrHit = 0
playerZoneSize = 0


class PongMultiplayerConsumer(AsyncWebsocketConsumer):
    id = None
    data = None
    game = None

    async def connect(self):
        print("[CONNECT PONG MULTI]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_pongMulti"

        if "id" in self.scope["url_route"]["kwargs"]:
            self.id = self.scope["url_route"]["kwargs"]["id"]
            print("[GAME ID]", self.id, file=sys.stderr)
            self.room_group_name = "pong_multi_" + str(self.id)
        else:
            print("[ERROR] no id", file=sys.stderr)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print("[DISCONNECT PONG MULTI]", self.scope["user"], self.room_group_name, file=sys.stderr)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if (text_data_json['type'] == 'move_paddle'):
            multi_utils.move_paddle(text_data_json['move'], text_data_json['player'], int(self.id))
            multi_utils.send_updates(int(self.id))
            
    @database_sync_to_async
    def get_game(self, game_id):
        from app.models import Game_PongMulti

        game = get_object_or_404(Game_PongMulti, id=game_id)
        return game
        
    
    async def game_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    async def update_after_death(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))