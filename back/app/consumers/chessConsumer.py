import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
import app.consumers.utils.chess_utils as chess_utils

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

        # check if user is in game
        if (await self.get_white_player(self.id) == self.scope["user"]):
            color_player = "white"
        elif (await self.get_black_player(self.id) == self.scope["user"]):
            color_player = "black"
        else:
            print("[ERROR] not in game", file=sys.stderr)
            return

        if (await self.is_finished(self.id)):
            print("[ERROR] game is finished", file=sys.stderr)
            return

        if (data['type'] == 'move'):
            await self.move_piece(data['from'], data['to'], int(self.id))
        
        elif (data['type'] == 'resign'):
            print("[RESIGN]", file=sys.stderr)
            if (color_player == "white"):
                winner = "black"
            else:
                winner = "white"
            await chess_utils.save_result_game(int(self.id), winner, 'resign')
        
        elif (data['type'] == 'propose_draw'):
            print("[PROPOSE DRAW] by ",self.scope["user"], "for", self.id, file=sys.stderr)
            await chess_utils.propose_draw(int(self.id), color_player)
            
        elif (data['type'] == 'accept_draw'):
            print("[ACCEPT DRAW] by ",self.scope["user"], "for", self.id, file=sys.stderr)
            # verif also if draw is proposed by the opponent
            await chess_utils.save_result_game(self.id, 0, 'agreement')
        
        elif (data['type'] == 'decline_draw'):
            print("[DECLINE DRAW] by ",self.scope["user"], "for", self.id, file=sys.stderr)
            await chess_utils.decline_draw(int(self.id), color_player)
        
    
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

        await self.save_move(game_id)

        board = chess_utils.get_board(game_id)
        await chess_utils.verif_end_game(board, game_id)

    @database_sync_to_async
    def modif_board(self, posPiece, posReach, game_id):
        from app.models import Game_Chess
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


        # check if move is valid
        piece.setPossibleMoves(board, posPiece['x'], posPiece['y'])
        chess_utils.last_verif_move(board, board[posPiece['y']][posPiece['x']].piece.color, {'x': posPiece['x'], 'y': posPiece['y']})
        if board[posReach['y']][posReach['x']].possibleMove == 0:
            return "Invalid move"


        move_piece(board, posPiece, posReach)
        # verif for opponent
        chess_utils.reset_possible_moves(board)

        game.turn_white = not game.turn_white
        game.save()

        return "good"

    @database_sync_to_async
    def save_move(self, game_id):
        from app.models import Game_Chess
        game = get_object_or_404(Game_Chess, id=game_id)
        board = chess_utils.get_board(game_id)
        # transform board in JSON
        board_json = []
        for i in range(8):
            board_json.append([])
            for j in range(8):
                if board[i][j].piece == 0:
                    board_json[i].append(0)
                else:
                    board_json[i].append(board[i][j].piece.toJSON())

        game.all_position.append(board_json) 
        game.save()

    @database_sync_to_async
    def get_white_player(self, game_id):
        from app.models import Game_Chess
        game = get_object_or_404(Game_Chess, id=game_id)
        return game.white_player

    @database_sync_to_async
    def get_black_player(self, game_id):
        from app.models import Game_Chess
        game = get_object_or_404(Game_Chess, id=game_id)
        return game.black_player

    @database_sync_to_async
    def is_finished(self, game_id):
        from app.models import Game_Chess
        game = get_object_or_404(Game_Chess, id=game_id)
        return game.status == "finish"

    async def propose_draw(self, event):
        if (event['color'] == "black" and await self.get_white_player(self.id) == self.scope["user"]):
            await self.send(text_data=json.dumps(event))
        if (event['color'] == "white" and await self.get_black_player(self.id) == self.scope["user"]):
            await self.send(text_data=json.dumps(event))

    async def move(self, event):
        await self.send(text_data=json.dumps(event))

    async def end_game(self, event):
        await self.send(text_data=json.dumps(event))


def move_piece(board, posPiece, posReach):
    import app.consumers.utils.chess_class as chess_class

    board[posReach['y']][posReach['x']].move = 1
    board[posPiece['y']][posPiece['x']].move = 1

    board[posReach['y']][posReach['x']].piece = board[posPiece['y']][posPiece['x']].piece
    board[posPiece['y']][posPiece['x']].piece = 0

    x = posReach['x']
    y = posReach['y']

    # handle en passant
    # if pawn move 2 squares
    if (isinstance(board[y][x].piece, chess_class.Pawn) and abs(y - posPiece['y']) == 2):
        if (board[y][x].piece.color == "white"):
            board[y+1][x].enPassant = 1
        else:
            board[y-1][x].enPassant = 1
    # if do an en passant
    if (board[y][x].enPassant and isinstance(board[y][x].piece, chess_class.Pawn)):
        posY = 0
        if (board[y][x].piece.color == "white"):
            posY = y + 1
        else:
            posY = y - 1
        board[posY][x].piece = 0

    # handle castling (roque)
    if (isinstance(board[y][x].piece, chess_class.King) and abs(x - posPiece['x']) == 2):
        do_castling(board, x, y)

    #handle pawn promotion
    if (isinstance(board[y][x].piece, chess_class.Pawn) and (y == 0 or y == 7)):
        board[y][x].piece = chess_class.Queen(board[y][x].piece.color)

    remove_en_passant(board, board[y][x].piece.color)


def do_castling(board, x, y):
    import app.consumers.utils.chess_class as chess_class

    if (x == 2):
        color = board[y][0].piece.color
        board[y][0].piece = 0
        board[y][3].piece = chess_class.Rook(color)
    elif (x == 6):
        color = board[y][7].piece.color
        board[y][7].piece = 0
        board[y][5].piece = chess_class.Rook(color)

def remove_en_passant(board, color):
    if (color == "white"):
        y = 3
    else:
        y = 5
    for i in range(8):
        if (board[y][i].enPassant):
            board[y][i].enPassant = 0
