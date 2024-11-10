function reset_possible_moves(board)
{
    let allmove = document.getElementsByClassName("move");
    for (let i = allmove.length - 1; i >= 0; i--)
        allmove[i].remove();

    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            board[i][j].possibleMove = false;
        }
    }
}

function reset_possible_castling(board)
{
    board[0][2].castling = false;
    board[0][6].castling = false;
    board[7][2].castling = false;
    board[7][6].castling = false;
}

function last_verif_move(board, color, piecePos)
{
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (board[y][x].possibleMove)
            {
                let cp_board = Array.from(board, x => x.map(y => Object.assign({}, y)));
                cp_board[y][x].piece = cp_board[piecePos.y][piecePos.x].piece;
                cp_board[piecePos.y][piecePos.x].piece = null;
                reset_possible_moves(cp_board);
                if (verif_check(cp_board, color))
                    board[y][x].possibleMove = false;
                if (board[y][x].castling)
                {
                    if (x == 2 && !bigCastling(board, x, y))
                    {
                        board[y][x].possibleMove = false;
                        board[y][x].castling = false;
                    }
                    if (x == 6 && !smallCastling(board, x, y))
                    {
                        board[y][x].possibleMove = false;
                        board[y][x].castling = false;
                    }
                }
            }

        }
    }
}

function verif_check(cp_board, color)
{
    let kingPos = getKingPos(cp_board, color);
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (cp_board[y][x].piece && cp_board[y][x].piece.color != color)
            {
                cp_board[y][x].piece.setPossibleMoves(cp_board, x, y);
                if (cp_board[kingPos.y][kingPos.x].possibleMove)
                {
                    console.log("check", x, y, kingPos.x, kingPos.y);
                    return true;
                }
            }
        }
    }
    return false
}

function verif_end_game(board, color)
{
    let cp_board = Array.from(board, x => x.map(y => Object.assign({}, y)));
    if (!can_move(cp_board, color))
    {
        if (verif_check(cp_board, color))
            alert("Check " + color);
        else
            alert("Pat");
    }
}

function can_move(cp_board, color)
{
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (cp_board[y][x].piece && cp_board[y][x].piece.color == color)
            {
                cp_board[y][x].piece.setPossibleMoves(cp_board, x, y);
                last_verif_move(cp_board, color, {'x': x, 'y': y});
                for (let i = 0; i < 8; i++)
                {
                    for (let j = 0; j < 8; j++)
                    {
                        if (cp_board[i][j].possibleMove)
                            return true;
                    }
                }
            }
        }
    }
}

function getKingPos(board, color)
{
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (board[y][x].piece && board[y][x].piece.color == color && board[y][x].piece.constructor.name == "King")
            {
                console.log("king", x, y);
                return ({'x': x, 'y': y});
            }
        }
    }
    return ({'x': 0, 'y': 0});
}

function remove_en_passant(board, color)
{
    let y = 0;
    if (color == "white")
        y = 2;
    else
        y = 5;
    for (let x = 0; x < 8; x++)
    {
        console.log("remove en passant",board[y][x].enPassant, x, y);
        board[y][x].enPassant = false;
    }
}

function bigCastling(board, x, y)
{
    let cp_board = Array.from(board, x => x.map(y => Object.assign({}, y)));
    if (verif_check(cp_board, board[y][4].piece.color) || !board[y][3].possibleMove)
        return false
    return true
}

function smallCastling(board, x, y)
{
    let cp_board = Array.from(board, x => x.map(y => Object.assign({}, y)));
    if (verif_check(cp_board, board[y][4].piece.color) || !board[y][5].possibleMove)
        return false
    return true
}

function whosPlaying(color)
{
	var blackPlayer = document.getElementById("BlackPlayer");
	var whitePlayer = document.getElementById("WhitePlayer");
	if (color == "white" && blackPlayer && whitePlayer)
	{
		blackPlayer.setAttribute("style", "opacity: 0.2;");	
		whitePlayer.setAttribute("style", "opacity: 1;");	
	}
	else if (blackPlayer && whitePlayer)
	{
		blackPlayer.setAttribute("style", "opacity: 1;");	
		whitePlayer.setAttribute("style", "opacity: 0.2;");	
	}	
}