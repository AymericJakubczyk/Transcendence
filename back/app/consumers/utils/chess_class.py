import json


class Cell:
	def __init__(self):
		self.piece = 0
		self.possibleMove = 0
		self.move = 0
		self.enPassant = 0
		self.castling = 0 # roque


	def toJSON(self):
		mydict = {"piece": self.piece, "possibleMove": self.possibleMove, "move": self.move, "enPassant": self.enPassant, "castling": self.castling}
		return mydict

	def __repr__(self):
		return "{piece: " + str(self.piece) + ", possibleMove: " + str(self.possibleMove) + ", move: " + str(self.move) + ", enPassant: " + str(self.enPassant) + ", castling: " + str(self.castling) + "}"


class Pawn:
	def __init__(self, color):
		self.color = color
	
	def setPossibleMoves(self, board, x, y):
		if (self.color == 'white'):
			if (y == 6 and board[y-1][x]['piece'] == 0 and board[y-2][x]['piece'] == 0):
				board[y-2][x]['possibleMove'] = 1
				board[y-1][x]['enPassant'] = 1

			if (board[y-1][x]['piece'] == 0):
				board[y-1][x]['possibleMove'] = 1
			if (y - 1 >= 0 and x + 1 < 8 and board[y-1][x+1]['piece'] != 0 and board[y-1][x+1]['piece']['color'] != self.color):
				board[y-1][x+1]['possibleMove'] = 1
			if (y - 1 >= 0 and x - 1 >= 0 and board[y-1][x-1]['piece'] != 0 and board[y-1][x-1]['piece']['color'] != self.color):
				board[y-1][x-1]['possibleMove'] = 1
			if (y - 1 == 2 and x + 1 < 8 and board[y-1][x+1]['enPassant']):
				board[y-1][x+1]['possibleMove'] = 1
			if (y - 1 == 2 and x - 1 >= 0 and board[y-1][x-1]['enPassant']):
				board[y-1][x-1]['possibleMove'] = 1
		elif (self.color == 'black'):
			if (y == 1 and board[y+1][x]['piece'] == 0 and board[y+2][x]['piece'] == 0):
				board[y+2][x]['possibleMove'] = 1
				board[y+1][x]['enPassant'] = 1

			if (board[y+1][x]['piece'] == 0):
				board[y+1][x]['possibleMove'] = 1
			if (y + 1 < 8 and x + 1 < 8 and board[y+1][x+1]['piece'] != 0 and board[y+1][x+1]['piece']['color'] != self.color):
				board[y+1][x+1]['possibleMove'] = 1
			if (y + 1 < 8 and x - 1 >= 0 and board[y+1][x-1]['piece'] != 0 and board[y+1][x-1]['piece']['color'] != self.color):
				board[y+1][x-1]['possibleMove'] = 1
			if (y + 1 == 5 and x + 1 < 8 and board[y+1][x+1]['enPassant']):
				board[y+1][x+1]['possibleMove'] = 1
			if (y + 1 == 5 and x - 1 >= 0 and board[y+1][x-1]['enPassant']):
				board[y+1][x-1]['possibleMove'] = 1

	def toJSON(self):
		mydict = {"type": "Pawn", "color": self.color}
		return mydict

	def __repr__(self):
		return "{type: 'Pawn', color: '" + self.color + "'}"


class Rook:
	def __init__(self, color):
		self.color = color
	
	def setPossibleMoves(self, board, x, y):
		for i in range(x + 1, 8):
			if (verif_loop_moove(board, self.color, i, y)):
				break
		for i in range(x - 1, -1, -1):
			if (verif_loop_moove(board, self.color, i, y)):
				break
		for j in range(y + 1, 8):
			if (verif_loop_moove(board, self.color, x, j)):
				break
		for j in range(y - 1, -1, -1):
			if (verif_loop_moove(board, self.color, x, j)):
				break


	def toJSON(self):
		mydict = {"type": "Rook", "color": self.color}
		return mydict

	def __repr__(self):
		return "{type: 'Rook', color: '" + self.color + "'}"


class Knight:
	def __init__(self, color):
		self.color = color
	
	def setPossibleMoves(self, board, x, y):
		if (x - 1 >= 0 and y - 2 >= 0 and (board[y-2][x-1]['piece'] == 0 or (board[y-2][x-1]['piece'] and board[y-2][x-1]['piece']['color'] != self.color))):
			board[y-2][x-1]['possibleMove'] = 1
		if (x + 1 <= 7 and y - 2 >= 0 and (board[y-2][x+1]['piece'] == 0 or (board[y-2][x+1]['piece'] and board[y-2][x+1]['piece']['color'] != self.color))):
			board[y-2][x+1]['possibleMove'] = 1
		if (x - 2 >= 0 and y - 1 >= 0 and (board[y-1][x-2]['piece'] == 0 or (board[y-1][x-2]['piece'] and board[y-1][x-2]['piece']['color'] != self.color))):
			board[y-1][x-2]['possibleMove'] = 1
		if (x + 2 <= 7 and y - 1 >= 0 and (board[y-1][x+2]['piece'] == 0 or (board[y-1][x+2]['piece'] and board[y-1][x+2]['piece']['color'] != self.color))):
			board[y-1][x+2]['possibleMove'] = 1
		if (x - 2 >= 0 and y + 1 <= 7 and (board[y+1][x-2]['piece'] == 0 or (board[y+1][x-2]['piece'] and board[y+1][x-2]['piece']['color'] != self.color))):
			board[y+1][x-2]['possibleMove'] = 1
		if (x + 2 <= 7 and y + 1 <= 7 and (board[y+1][x+2]['piece'] == 0 or (board[y+1][x+2]['piece'] and board[y+1][x+2]['piece']['color'] != self.color))):
			board[y+1][x+2]['possibleMove'] = 1
		if (x - 1 >= 0 and y + 2 <= 7 and (board[y+2][x-1]['piece'] == 0 or (board[y+2][x-1]['piece'] and board[y+2][x-1]['piece']['color'] != self.color))):
			board[y+2][x-1]['possibleMove'] = 1
		if (x + 1 <= 7 and y + 2 <= 7 and (board[y+2][x+1]['piece'] == 0 or (board[y+2][x+1]['piece'] and board[y+2][x+1]['piece']['color'] != self.color))):
			board[y+2][x+1]['possibleMove'] = 1

	def toJSON(self):
		mydict = {"type": "Knight", "color": self.color}
		return mydict

	def __repr__(self):
		return "{type: 'Knight', color: '" + self.color + "'}"



class Bishop:
	def __init__(self, color):
		self.color = color
	
	def setPossibleMoves(self, board, x, y):
		for i,j in zip(range(x + 1, 8), range(y + 1, 8)):
			if (verif_loop_moove(board, self.color, i, j)):
				break
		for i,j in zip(range(x - 1, -1, -1), range(y - 1, -1, -1)):
			if (verif_loop_moove(board, self.color, i, j)):
				break
		for i,j in zip(range(x + 1, 8), range(y - 1, -1, -1)):
			if (verif_loop_moove(board, self.color, i, j)):
				break
		for i,j in zip(range(x - 1, -1, -1), range(y + 1, 8)):
			if (verif_loop_moove(board, self.color, i, j)):
				break

	def toJSON(self):
		mydict = {"type": "Bishop", "color": self.color}
		return mydict

	def __repr__(self):
		return "{type: 'Bishop', color: '" + self.color + "'}"


class Queen:
	def __init__(self, color):
		self.color = color
	
	def setPossibleMoves(self, board, x, y):
		Rook(self.color).setPossibleMoves(board, x, y)
		Bishop(self.color).setPossibleMoves(board, x, y)

	def toJSON(self):
		mydict = {"type": "Queen", "color": self.color}
		return mydict

	def __repr__(self):
		return "{type: 'Queen', color: '" + self.color + "'}"



class King:
	def __init__(self, color):
		self.color = color
	
	def setPossibleMoves(self, board, x, y):
		if (x - 1 >= 0 and (board[y][x-1]['piece'] == 0 or (board[y][x-1]['piece'] and board[y][x-1]['piece']['color'] != self.color))):
			board[y][x-1]['possibleMove'] = 1
		if (x + 1 <= 7 and (board[y][x+1]['piece'] == 0 or (board[y][x+1]['piece'] and board[y][x+1]['piece']['color'] != self.color))):
			board[y][x+1]['possibleMove'] = 1
		if (y - 1 >= 0 and (board[y-1][x]['piece'] == 0 or (board[y-1][x]['piece'] and board[y-1][x]['piece']['color'] != self.color))):
			board[y-1][x]['possibleMove'] = 1
		if (y + 1 <= 7 and (board[y+1][x]['piece'] == 0 or (board[y+1][x]['piece'] and board[y+1][x]['piece']['color'] != self.color))):
			board[y+1][x]['possibleMove'] = 1
		if (x - 1 >= 0 and y - 1 >= 0 and (board[y-1][x-1]['piece'] == 0 or (board[y-1][x-1]['piece'] and board[y-1][x-1]['piece']['color'] != self.color))):
			board[y-1][x-1]['possibleMove'] = 1
		if (x + 1 <= 7 and y - 1 >= 0 and (board[y-1][x+1]['piece'] == 0 or (board[y-1][x+1]['piece'] and board[y-1][x+1]['piece']['color'] != self.color))):
			board[y-1][x+1]['possibleMove'] = 1
		if (x - 1 >= 0 and y + 1 <= 7 and (board[y+1][x-1]['piece'] == 0 or (board[y+1][x-1]['piece'] and board[y+1][x-1]['piece']['color'] != self.color))):
			board[y+1][x-1]['possibleMove'] = 1
		if (x + 1 <= 7 and y + 1 <= 7 and (board[y+1][x+1]['piece'] == 0 or (board[y+1][x+1]['piece'] and board[y+1][x+1]['piece']['color'] != self.color))):
			board[y+1][x+1]['possibleMove'] = 1
		
		# Castling (roque)
		if (not board[y][x]['move'] and not board[y][0]['move'] and board[y][1]['piece'] == 0 and board[y][2]['piece'] == 0 and board[y][3]['piece'] == 0):
			board[y][2]['possibleMove'] = 1
			board[y][2]['castling'] = 1
		if (not board[y][x]['move'] and not board[y][7]['move'] and board[y][5]['piece'] == 0 and board[y][6]['piece'] == 0):
			board[y][6]['possibleMove'] = 1
			board[y][6]['castling'] = 1

	def toJSON(self):
		mydict = {"type": "King", "color": self.color}
		return mydict

	def __repr__(self):
		return "{type: 'King', color: '" + self.color + "'}"








def verif_loop_moove(board, my_color, x, y):
	if (board[y][x]['piece'] == 0):
		board[y][x]['possibleMove'] = 1
		return 0
	elif (board[y][x]['piece']['color'] != my_color):
		board[y][x]['possibleMove'] = 1
		return 1
	else:
		return 1