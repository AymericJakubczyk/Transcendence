import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .utils import pong_utils

import sys #for print

class PongConsumer(AsyncWebsocketConsumer):
    id = None

    async def connect(self):
        print("[CONNECT PONG RANKED]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_pong"

        if "id" in self.scope["url_route"]["kwargs"]:
            self.id = self.scope["url_route"]["kwargs"]["id"]
            print("[GAME ID]", self.id, file=sys.stderr)
            self.room_group_name = "ranked_pong_" + str(self.id)
        else:
            print("[ERROR] no id", file=sys.stderr)
            return
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        print("[DISCONNECT PONG RANKED]", self.scope["user"], self.room_group_name, file=sys.stderr)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if (text_data_json['type'] == 'move_paddle'):
            await pong_utils.move_paddle(text_data_json['move'], text_data_json['player'], int(self.id))



    # ======================== SENDER ======================== #
    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def bump(self, event):
        await self.send(text_data=json.dumps(event))

    async def end_game(self, event):
        await self.send(text_data=json.dumps(event))

    async def countdown(self, event):
        await self.send(text_data=json.dumps(event))