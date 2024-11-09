import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async

import sys #for print

class ChessConsumer(AsyncWebsocketConsumer):
    id = None

    async def connect(self):
        print("[CONNECT]", self.scope["user"], file=sys.stderr)
        self.room_group_name = self.scope["user"].username + "_chess"

        if "id" in self.scope["url_route"]["kwargs"]:
            self.id = self.scope["url_route"]["kwargs"]["id"]
            print("[GAME ID]", self.id, file=sys.stderr)
            self.room_group_name = "ranked_chess_" + str(self.id)
        else:
            print("[ERROR] no id", file=sys.stderr)
            return
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        print("[DISCONNECT]", file=sys.stderr)


    async def receive(self, text_data):
        data = json.loads(text_data)
        print("[RECEIVE WS]", data, file=sys.stderr)

        if (data['type'] == 'move'):
            await self.move_piece(data['from'], data['to'], int(self.id))
        
    
    async def move_piece(self, posPiece, posReach, game_id):
        print("[MOVE PIECE]", posPiece, posReach, file=sys.stderr)
        # if verif is good (WIP)
        
        await self.modif_board(posPiece, posReach, game_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'move',
                'from': posPiece,
                'to': posReach
            }
        )


    @database_sync_to_async
    def modif_board(self, posPiece, posReach, game_id):
        from app.models import Game_Chess

        game = get_object_or_404(Game_Chess, id=game_id)
        print("[MODIF BOARD]", posPiece, posReach, file=sys.stderr)

        game.board[posReach['y']][posReach['x']]['piece'] = game.board[posPiece['y']][posPiece['x']]['piece']
        game.board[posPiece['y']][posPiece['x']]['piece'] = 0

        game.save()


    async def move(self, event):
        await self.send(text_data=json.dumps(event))