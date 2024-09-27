import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
import random

import sys #for print

nbr_waiter = 0
list_waiter = []

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global nbr_waiter
        global list_waiter
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_pong"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        if (nbr_waiter >= 1):
            game = await self.create_game(list_waiter[0], self.room_group_name)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'match_found',
                    'adversaire': list_waiter[0],
                    'game_id': game.id
                }
            )
            await self.channel_layer.group_send(
                list_waiter[0],
                {
                    'type': 'match_found',
                    'adversaire': self.room_group_name,
                    'game_id': game.id
                }
            )
            nbr_waiter -= 1
            list_waiter.remove(list_waiter[0])
        
        await self.accept()
        nbr_waiter += 1
        list_waiter.append(self.room_group_name)

    async def disconnect(self, close_code):
        global nbr_waiter
        global list_waiter
        print("[DISCONNECT]", file=sys.stderr)

        if list_waiter.count(self.room_group_name) > 0:
            nbr_waiter -= 1
            list_waiter.remove(self.room_group_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print("[RECEIVE WS]", text_data_json, file=sys.stderr)
    
    async def match_found(self, event):
        print("[MATCH FOUND]", event, file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'adversaire': event['adversaire'],
            'game_id': event['game_id']
        }))

    @database_sync_to_async
    def create_game(self, player1_username, player2_username):
        from app.models import User, Game_Pong, PongDataGame
        # do random for white player now i don't care

        # remove _pong from username
        player1_username = player1_username[:-5]
        player2_username = player2_username[:-5]
        print("[CREATE CHESS GAME]", player1_username, player2_username, file=sys.stderr)

        player1 = get_object_or_404(User, username=player1_username)
        player2 = get_object_or_404(User, username=player2_username)
        data = PongDataGame()
        data.ball_dy = random.random() - 0.5
        data.ball_dx = random.choice([0.5, -0.5])
        data.save()
        game = Game_Pong()
        game.player1 = player1
        game.player2 = player2
        game.data = data
        game.save()
        return game