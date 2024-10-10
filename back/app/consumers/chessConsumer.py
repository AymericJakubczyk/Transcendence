import json
import random
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from app.models import User, Game_Chess

import sys #for print

nbr_waiter = 0
list_waiter = []

class ChessConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global nbr_waiter
        global list_waiter
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_chess"

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
                    'white' : game.white_player.username,
                    'black' : game.black_player.username,
                    'adversaire': list_waiter[0],
                    'game_id': game.id
                }
            )
            await self.channel_layer.group_send(
                list_waiter[0],
                {
                    'type': 'match_found',
                    'white' : game.white_player.username,
                    'black' : game.black_player.username,
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
            'game_id': event['game_id'],
            'white': event['white'],
            'black': event['black']
        }))

    @database_sync_to_async
    def create_game(self, player1_username, player2_username):
        # do random for white player now i don't care

        # remove _chess from username
        player1_username = player1_username[:-6]
        player2_username = player2_username[:-6]
        print("[CREATE CHESS GAME]", player1_username, player2_username, file=sys.stderr)

        player1 = get_object_or_404(User, username=player1_username)
        player2 = get_object_or_404(User, username=player2_username)
        game = Game_Chess()
        value = random.random()
        print(value, file=sys.stderr)
        if value < 0.5:
            game.white_player = player1
            game.black_player = player2
        else :
            game.white_player = player2
            game.black_player = player1
        game.board = []
        for i in range(8):
            game.board.append([])
            for j in range(8):
                game.board[i].append({'piece': None, 'color': None})
        game.save()
        return game