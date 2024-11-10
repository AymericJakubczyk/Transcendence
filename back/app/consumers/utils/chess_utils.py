import app.consumers.utils.chess_class as chess_class

import sys


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