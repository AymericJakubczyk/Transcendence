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
        
        move = await self.modif_board(posPiece, posReach, game_id)
        if move != "good":
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': move
            }))
            return
        
        
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
        import app.consumers.utils.chess_class as chess_class
        import app.consumers.utils.chess_utils as chess_utils

        if (posPiece['x'] > 7 or posPiece['x'] < 0 or posPiece['y'] > 7 or posPiece['y'] < 0 or posReach['x'] > 7 or posReach['x'] < 0 or posReach['y'] > 7 or posReach['y'] < 0):
            return "STOP HACKING"


        game = get_object_or_404(Game_Chess, id=game_id)
        board = chess_utils.get_board(game_id)
        piece = board[posPiece['y']][posPiece['x']].piece

        if piece == 0:
            return "Bro there is no piece here STOP HACKING"

        # check if it is the turn of the player
        if game.turn_white and game.white_player != self.scope["user"]:
            return "Not your turn (STOP HACKING)"
        if not game.turn_white and game.black_player != self.scope["user"]:
            return "Not your turn (STOP HACKING)"

        # check if the piece is a piece of the player
        if game.turn_white and piece.color != 'white':
            return "Not your piece (STOP HACKING)"
        if not game.turn_white and piece.color == 'white':
            return "Not your piece (STOP HACKING)"


        # TO FINISH : check if move is valid
        piece.setPossibleMoves(board, posPiece['x'], posPiece['y'])
        if board[posReach['y']][posReach['x']].possibleMove == 0:
            return "Invalid move"




        board[posReach['y']][posReach['x']].piece = board[posPiece['y']][posPiece['x']].piece
        board[posPiece['y']][posPiece['x']].piece = 0

        reset_possible_moves(board)

        game.turn_white = not game.turn_white
        game.save()

        return "good"

    async def move(self, event):
        await self.send(text_data=json.dumps(event))



def reset_possible_moves(board):
    for i in range(8):
        for j in range(8):
            board[i][j].possibleMove = 0
