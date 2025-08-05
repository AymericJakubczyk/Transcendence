import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from functools import partial

import sys
import time

class pongTournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("[WS PONG CONNECT]", self.scope["user"], file=sys.stderr)
        await self.accept()

        if (self.scope["user"].tournament_id):
            print("[WS PONG] user already in a tournament", file=sys.stderr)
            self.room_group_name = "pong_tournament_" + str(self.scope["user"].tournament_id)
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        else:
            print("[WS PONG] user not in a tournament", file=sys.stderr)


    async def disconnect(self, close_code):
        print("[WS PONG DISCONNECT] group : ", self.room_group_name, file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("[RECEIVE WS]", text_data_json, file=sys.stderr)

    async def refresh_infos(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def update_room(self, event):
        await self.send(text_data=json.dumps(event))