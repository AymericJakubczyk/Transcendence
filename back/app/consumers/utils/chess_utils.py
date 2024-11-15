import app.consumers.utils.chess_class as chess_class
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from django.shortcuts import get_object_or_404
from app.models import Game_Chess, User
from channels.db import database_sync_to_async

import sys
import copy


all_chess_data = {}


def launch_game(id):
    global all_chess_data

    board = []
    for i in range(8):
        board.append([])
        for j in range(8):
            board[i].append(chess_class.Cell())

    for i in range(8):
        board[1][i].piece = chess_class.Pawn('black')
        board[6][i].piece = chess_class.Pawn('white')
    
        board[0][0].piece = board[0][7].piece = chess_class.Rook("black")
        board[0][1].piece = board[0][6].piece = chess_class.Knight("black")
        board[0][2].piece = board[0][5].piece = chess_class.Bishop("black")
        board[0][3].piece = chess_class.Queen("black")
        board[0][4].piece = chess_class.King("black")

        board[7][0].piece = board[7][7].piece = chess_class.Rook("white")
        board[7][1].piece = board[7][6].piece = chess_class.Knight("white")
        board[7][2].piece = board[7][5].piece = chess_class.Bishop("white")
        board[7][3].piece = chess_class.Queen("white")
        board[7][4].piece = chess_class.King("white")

    all_chess_data[id] = board


def get_board(id):
    global all_chess_data

    if id not in all_chess_data:
        return None
    return all_chess_data[id]


def reset_possible_moves(board):
    for i in range(8):
        for j in range(8):
            board[i][j].possibleMove = 0



async def verif_end_game(board, id):
    print("[VERIF]_end_game", file=sys.stderr)
    color = await get_color_turn(id)
    cp_board = copy.deepcopy(board)
    reset_possible_moves(cp_board)
    if not can_move(cp_board, color):
        if verif_check(cp_board, color):
            print("Checkmate", file=sys.stderr)
            if color == 'white':
                await save_result_game(id, 'black', 'checkmate')
            elif color == 'black':
                await save_result_game(id, 'white', 'checkmate')
            
        else:
            print("Pat", file=sys.stderr)
            await save_result_game(id, 0, 'pat')

async def resign_game(id, color):
    if color == 'white':
        await save_result_game(id, 'black', 'resign')
    elif color == 'black':
        await save_result_game(id, 'white', 'resign')


@database_sync_to_async
def get_color_turn(id):
    game = get_object_or_404(Game_Chess, id=id)
    if game.turn_white: 
        return 'white' 
    else :
        return 'black'


@database_sync_to_async
def save_result_game(game_id, winner, by):
    game = get_object_or_404(Game_Chess, id=game_id)
    white_player = get_object_or_404(User, id=game.white_player.id)
    black_player = get_object_or_404(User, id=game.black_player.id)

    print("[SAVE RESULT]", game_id, winner, by, file=sys.stderr)
    print("[SAVE RESULT]", game.id, game.white_player.username, game.black_player.username, file=sys.stderr)

    # save player rank before game
    game.white_player_rank = white_player.chess_rank
    game.black_player_rank = black_player.chess_rank

    # calcul elo
    proba_win_pw = 1 / (1 + 10 ** ((black_player.chess_rank - white_player.chess_rank) / 400))
    proba_win_pb = 1 / (1 + 10 ** ((white_player.chess_rank - black_player.chess_rank) / 400))
    if (winner == 'white'):
        win_elo_pw = round(20 * (1 - proba_win_pw))
        win_elo_pb = round(20 * (0 - proba_win_pb))
    elif (winner == 'black'):
        win_elo_pw = round(20 * (0 - proba_win_pw))
        win_elo_pb = round(20 * (1 - proba_win_pb))
    else:
        win_elo_pw = round(20 * (0.5 - proba_win_pw))
        win_elo_pb = round(20 * (0.5 - proba_win_pb))
    print("[ELO ADD]", win_elo_pw, win_elo_pb, file=sys.stderr)
    game.white_player_rank_win += win_elo_pw
    game.black_player_rank_win += win_elo_pb
    white_player.chess_rank += win_elo_pw
    black_player.chess_rank += win_elo_pb


    white_player.save()
    black_player.save()

    game.status = "finish"
    if winner == 'white':
        game.winner = game.white_player
    elif winner == 'black':
        game.winner = game.black_player
    game.reason_endgame = str(by)
    print("[DEBUG] Saving game object", game, file=sys.stderr)
    game.save()
    print("[DEBUG] Game object saved", game, file=sys.stderr)
    
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "ranked_chess_" + str(game_id),
        {
            'type': 'end_game',
            'winner': winner,
            'reason':by,     
            'white_elo': game.white_player_rank,
            'black_elo': game.black_player_rank,
            'white_elo_win': game.white_player_rank_win,
            'black_elo_win': game.black_player_rank_win       
        }
    )



def can_move(cp_board, color):
    for y in range(8):
        for x in range(8):
            if cp_board[y][x].piece and cp_board[y][x].piece.color == color:
                cp_board[y][x].piece.setPossibleMoves(cp_board, x, y)
                last_verif_move(cp_board, color, {'x': x, 'y': y})
                for i in range(8):
                    for j in range(8):
                        if cp_board[i][j].possibleMove:
                            print("can move", i, j, cp_board[y][x].piece, x, y, file=sys.stderr)
                            return True
    return False

def last_verif_move(board, color, piecePos):
    for y in range(8):
        for x in range(8):
            if board[y][x].possibleMove:
                cp_board = copy.deepcopy(board)
                cp_board[y][x].piece = cp_board[piecePos['y']][piecePos['x']].piece
                cp_board[piecePos['y']][piecePos['x']].piece = 0
                reset_possible_moves(cp_board)
                if verif_check(cp_board, color):
                    board[y][x].possibleMove = 0
                if isinstance(board[piecePos['y']][piecePos['x']].piece, chess_class.King) and abs(x - piecePos['x']) == 2:
                    if x == 2 and not bigCastling(board, x, y):
                        board[y][x].possibleMove = 0
                    if x == 6 and not smallCastling(board, x, y):
                        board[y][x].possibleMove = 0

def verif_check(cp_board, color):
    kingPos = getKingPos(cp_board, color)
    for y in range(8):
        for x in range(8):
            if cp_board[y][x].piece and cp_board[y][x].piece.color != color:
                cp_board[y][x].piece.setPossibleMoves(cp_board, x, y)
                if cp_board[kingPos['y']][kingPos['x']].possibleMove:
                    return True
    return False


def getKingPos(board, color):
    for y in range(8):
        for x in range(8):
            if board[y][x].piece and board[y][x].piece.color == color and isinstance(board[y][x].piece, chess_class.King):
                return {'x': x, 'y': y}
    return {'x': 0, 'y': 0}


def bigCastling(board, x, y):
    cp_board = copy.deepcopy(board)
    reset_possible_moves(cp_board)

    if verif_check(cp_board, board[y][4].piece.color):
        return False
    cp_board[y][3].piece = cp_board[y][4].piece
    cp_board[y][4].piece = 0
    if verif_check(cp_board, board[y][4].piece.color):
        return False
    cp_board[y][2].piece = cp_board[y][3].piece
    cp_board[y][3].piece = 0
    if verif_check(cp_board, board[y][4].piece.color):
        return False
    return True

def smallCastling(board, x, y):
    cp_board = copy.deepcopy(board)
    reset_possible_moves(cp_board)

    if verif_check(cp_board, board[y][4].piece.color):
        return False
    cp_board[y][5].piece = cp_board[y][4].piece
    cp_board[y][4].piece = 0
    if verif_check(cp_board, board[y][4].piece.color):
        return False
    cp_board[y][6].piece = cp_board[y][5].piece
    cp_board[y][5].piece = 0
    if verif_check(cp_board, board[y][4].piece.color):
        return False
    return True