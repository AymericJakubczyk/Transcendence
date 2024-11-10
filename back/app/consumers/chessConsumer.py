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

        if (posPiece['x'] > 7 or posPiece['x'] < 0 or posPiece['y'] > 7 or posPiece['y'] < 0 or posReach['x'] > 7 or posReach['x'] < 0 or posReach['y'] > 7 or posReach['y'] < 0):
            return "WTF"

        game = get_object_or_404(Game_Chess, id=game_id)
        piece = game.board[posPiece['y']][posPiece['x']]['piece']
        print("[MODIF BOARD]", posPiece, posReach, file=sys.stderr)

        # check if it is the turn of the player
        if game.turn_white and game.white_player != self.scope["user"]:
            return "Not your turn"
        if not game.turn_white and game.black_player != self.scope["user"]:
            return "Not your turn"

        # check if the piece is a piece of the player
        if piece['color'] != 'white' and game.turn_white:
            return "Not your piece"
        if piece['color'] != 'black' and not game.turn_white:
            return "Not your piece"

        # TO DO : check if move is valid
        if piece['type'] == 'Pawn':
            chess_class.Pawn(piece['color']).setPossibleMoves(game.board, posPiece['x'], posPiece['y'])
        elif piece['type'] == 'Rook':
            chess_class.Rook(piece['color']).setPossibleMoves(game.board, posPiece['x'], posPiece['y'])
        elif piece['type'] == 'Knight':
            chess_class.Knight(piece['color']).setPossibleMoves(game.board, posPiece['x'], posPiece['y'])
        elif piece['type'] == 'Bishop':
            chess_class.Bishop(piece['color']).setPossibleMoves(game.board, posPiece['x'], posPiece['y'])
        elif piece['type'] == 'Queen':
            chess_class.Queen(piece['color']).setPossibleMoves(game.board, posPiece['x'], posPiece['y'])
        elif piece['type'] == 'King':
            chess_class.King(piece['color']).setPossibleMoves(game.board, posPiece['x'], posPiece['y'])
        
        if game.board[posReach['y']][posReach['x']]['possibleMove'] == 0:
            return "Invalid move"




        game.board[posReach['y']][posReach['x']]['piece'] = piece
        game.board[posPiece['y']][posPiece['x']]['piece'] = 0

        reset_possible_moves(game.board)

        game.turn_white = not game.turn_white
        game.save()

        return "good"

    async def move(self, event):
        await self.send(text_data=json.dumps(event))

def reset_possible_moves(board):
    for i in range(8):
        for j in range(8):
            board[i][j]['possibleMove'] = 0
