class Cell
{
    constructor()
    {
        this.piece = null;
        this.possibleMove = false;
        this.move = false;
        this.enPassant = false;
        this.castling = false; // roque
    }
}

class Pawn {
    constructor (color)
    {
        this.color = color;
        this.src = "/static/srcs/chess/" + color + "pawn.svg";
    }
    
    setPossibleMoves(board, x, y)
    {
        if (this.color == 'white')
        {
            if (y == 6 && board[y-1][x].piece == null && board[y-2][x].piece == null)
                board[y-2][x].possibleMove = true;

            if (board[y-1][x].piece == null)
                board[y-1][x].possibleMove = true;
            if (y - 1 >= 0 && x + 1 < 8 && board[y-1][x+1].piece != null && board[y-1][x+1].piece.color != this.color)
                board[y-1][x+1].possibleMove = true;
            if (y - 1 >= 0 && x - 1 >= 0 && board[y-1][x-1].piece != null && board[y-1][x-1].piece.color != this.color)
                board[y-1][x-1].possibleMove = true;
            if (y - 1 == 2 && x + 1 < 8 && board[y-1][x+1].enPassant)
                board[y-1][x+1].possibleMove = true;
            if (y - 1 == 2 && x - 1 >= 0 && board[y-1][x-1].enPassant)
                board[y-1][x-1].possibleMove = true;
        }
        else if (this.color == 'black')
        {
            if (y == 1 && board[y+1][x].piece == null && board[y+2][x].piece == null)
                board[y+2][x].possibleMove = true;

            if (board[y+1][x].piece == null)
                board[y+1][x].possibleMove = true;
            if (y + 1 < 8 && x + 1 < 8 && board[y+1][x+1].piece != null && board[y+1][x+1].piece.color != this.color)
                board[y+1][x+1].possibleMove = true;
            if (y + 1 < 8 && x - 1 >= 0 && board[y+1][x-1].piece != null && board[y+1][x-1].piece.color != this.color)
                board[y+1][x-1].possibleMove = true;
            if (y + 1 == 5 && x + 1 < 8 && board[y+1][x+1].enPassant)
                board[y+1][x+1].possibleMove = true;
            if (y + 1 == 5 && x - 1 >= 0 && board[y+1][x-1].enPassant)
                board[y+1][x-1].possibleMove = true;
        }
    }
}

class Knight {
    constructor (color)
    {
        this.color = color;
        this.src = "/static/srcs/chess/" + color + "knight.svg";
    }
    
    setPossibleMoves(board, x, y)
    {
        if (x - 1 >= 0 && y - 2 >= 0 && (board[y-2][x-1].piece == null || (board[y-2][x-1].piece && board[y-2][x-1].piece.color != this.color)))
            board[y-2][x-1].possibleMove = true;
        if (x + 1 <= 7 && y - 2 >= 0 && (board[y-2][x+1].piece == null || (board[y-2][x+1].piece && board[y-2][x+1].piece.color != this.color)))
            board[y-2][x+1].possibleMove = true;
        if (x - 2 >= 0 && y - 1 >= 0 && (board[y-1][x-2].piece == null || (board[y-1][x-2].piece && board[y-1][x-2].piece.color != this.color)))
            board[y-1][x-2].possibleMove = true;
        if (x + 2 <= 7 && y - 1 >= 0 && (board[y-1][x+2].piece == null || (board[y-1][x+2].piece && board[y-1][x+2].piece.color != this.color)))
            board[y-1][x+2].possibleMove = true;
        if (x - 2 >= 0 && y + 1 <= 7 && (board[y+1][x-2].piece == null || (board[y+1][x-2].piece && board[y+1][x-2].piece.color != this.color)))
            board[y+1][x-2].possibleMove = true;
        if (x + 2 <= 7 && y + 1 <= 7 && (board[y+1][x+2].piece == null || (board[y+1][x+2].piece && board[y+1][x+2].piece.color != this.color)))
            board[y+1][x+2].possibleMove = true;
        if (x - 1 >= 0 && y + 2 <= 7 && (board[y+2][x-1].piece == null || (board[y+2][x-1].piece && board[y+2][x-1].piece.color != this.color)))
            board[y+2][x-1].possibleMove = true;
        if (x + 1 <= 7 && y + 2 <= 7 && (board[y+2][x+1].piece == null || (board[y+2][x+1].piece && board[y+2][x+1].piece.color != this.color)))
            board[y+2][x+1].possibleMove = true;
    }
}

class Rook {
    constructor (color)
    {
        this.color = color;
        this.src = "/static/srcs/chess/" + color + "rook.svg";
    }
    
    setPossibleMoves(board, x, y)
    {
        for (let i = x + 1; i < 8; i++)
        {
            if (verif_loop_moove(board, this.color, i, y))
                break;  
        }
        for (let i = x - 1; i >= 0; i--)
        {
            if (verif_loop_moove(board, this.color, i, y))
                break;
        }
        for (let j = y + 1; j < 8; j++)
        {
            if (verif_loop_moove(board, this.color, x, j))
                break;
        }
        for (let j = y - 1; j >= 0; j--)
        {
            if (verif_loop_moove(board, this.color, x, j))
                break;
        }
    }
}

class Bishop {
    constructor (color)
    {
        this.color = color;
        this.src = "/static/srcs/chess/" + color + "bishop.svg";
    }
    
    setPossibleMoves(board, x, y)
    {
        for (let i = x + 1, j = y + 1; i < 8 && j < 8; i++, j++)
        {
            if (verif_loop_moove(board, this.color, i, j))
                break;
        }
        for (let i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--)
        {
            if (verif_loop_moove(board, this.color, i, j))
                break;
        }
        for (let i = x + 1, j = y - 1; i < 8 && j >= 0; i++, j--)
        {
            if (verif_loop_moove(board, this.color, i, j))
                break;
        }
        for (let i = x - 1, j = y + 1; i >= 0 && j < 8; i--, j++)
        {
            if (verif_loop_moove(board, this.color, i, j))
                break;
        }    
    }
}

class King {
    constructor (color)
    {
        this.color = color;
        this.src = "/static/srcs/chess/" + color + "king.svg";
    }
    
    setPossibleMoves(board, x, y)
    {
        if (x - 1 >= 0 && (board[y][x-1].piece == null || board[y][x-1].piece.color != this.color))
            board[y][x-1].possibleMove = true;
        if (x + 1 <= 7 && (board[y][x+1].piece == null || board[y][x+1].piece.color != this.color))
            board[y][x+1].possibleMove = true;
        if (y - 1 >= 0 && (board[y-1][x].piece == null || board[y-1][x].piece.color != this.color))
            board[y-1][x].possibleMove = true;
        if (y + 1 <= 7 && (board[y+1][x].piece == null || board[y+1][x].piece.color != this.color))
            board[y+1][x].possibleMove = true;
        if (x - 1 >= 0 && y - 1 >= 0 && (board[y-1][x-1].piece == null || board[y-1][x-1].piece.color != this.color))
            board[y-1][x-1].possibleMove = true;
        if (x + 1 <= 7 && y - 1 >= 0 && (board[y-1][x+1].piece == null || board[y-1][x+1].piece.color != this.color))
            board[y-1][x+1].possibleMove = true;
        if (x - 1 >= 0 && y + 1 <= 7 && (board[y+1][x-1].piece == null || board[y+1][x-1].piece.color != this.color))
            board[y+1][x-1].possibleMove = true;
        if (x + 1 <= 7 && y + 1 <= 7 && (board[y+1][x+1].piece == null || board[y+1][x+1].piece.color != this.color))
            board[y+1][x+1].possibleMove = true;
        
        // Castling (roque)
        if (!board[y][x].move && !board[y][0].move && board[y][1].piece == null && board[y][2].piece == null && board[y][3].piece == null)
        {
            board[y][2].possibleMove = true;
            board[y][2].castling = true;
        }
        if (!board[y][x].move && !board[y][7].move && board[y][5].piece == null && board[y][6].piece == null)
        {
            board[y][6].possibleMove = true;
            board[y][6].castling = true;
        }
    }
}

class Queen {
    constructor (color)
    {
        this.color = color;
        this.src = "/static/srcs/chess/" + color + "queen.svg";
    }
    
    setPossibleMoves(board, x, y)
    {
        new Rook(this.color).setPossibleMoves(board, x, y);
        new Bishop(this.color).setPossibleMoves(board, x, y);
    }
}


function verif_loop_moove(board, my_color, x, y)
{
    if (board[y][x].piece == null)
    {
        board[y][x].possibleMove = true;
        return 0;
    }
    else if (board[y][x].piece.color != my_color)
    {
        board[y][x].possibleMove = true;
        return 1;
    }
    else
        return 1;
}