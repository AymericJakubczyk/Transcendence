let board = null;
let piecePos = null;
let player = "white";

function init_game()
{
    board = new Array(8);
    for (let i = 0; i < 8; i++)
    {
        board[i] = new Array(8);
        for (let j = 0; j < 8; j++)
            board[i][j] = new Cell();
    }

    for (let x = 0; x < 8; x++)
    {
        board[1][x].piece = new Pawn("black");
        board[6][x].piece = new Pawn("white");
    }

    board[0][0].piece = board[0][7].piece = new Rook("black");
    board[0][1].piece = board[0][6].piece = new Knight("black");
    board[0][2].piece = board[0][5].piece = new Bishop("black");
    board[0][3].piece = new Queen("black");
    board[0][4].piece = new King("black");

    board[7][0].piece = board[7][7].piece = new Rook("white");
    board[7][1].piece = board[7][6].piece = new Knight("white");
    board[7][2].piece = board[7][5].piece = new Bishop("white");
    board[7][3].piece = new Queen("white");
    board[7][4].piece = new King("white");

    first_display(board)
}

function first_display(board)
{
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (board[y][x].piece)
            {
                console.log(x,y,board[y][x].piece.src)
                let img = document.createElement("img");
                img.style.position = "absolute";
                img.src = board[y][x].piece.src;
                img.style.width = "100%";
                img.style.height = "100%";
                document.getElementById("cell"+x+y).appendChild(img);
            }
        }
    }
}

function display_possible_moves(board)
{
    for (let y = 0; y < 8; y++)
    {
        for (let x = 0; x < 8; x++)
        {
            if (board[y][x].possibleMove)
            {
                let img = document.createElement("img");
                img.setAttribute("class", "move")
                img.style.position = "absolute";
                img.style.opacity = "0.5";
                img.style.width = "100%";
                img.style.height = "100%";
                img.src = "/static/srcs/chess/move.svg";
                if (board[y][x].piece)
                    img.src = "/static/srcs/chess/eat.svg";
                document.getElementById("cell"+x+y).appendChild(img);
            }
        }
    }
}

function cell_click(x, y)
{
    if (board[y][x].possibleMove && piecePos)
    {
        console.log("move", piecePos.x, piecePos.y, x, y);
        document.getElementById("cell"+piecePos.x+piecePos.y).style.backgroundColor = (piecePos.x+piecePos.y) % 2 == 0 ? "antiquewhite" : "burlywood";
        reset_possible_moves(board);
        move_piece(piecePos, x, y);
        reset_possible_castling(board);
        player = player == "white" ? "black" : "white";
        return;
    }
    reset_possible_moves(board);
    reset_possible_castling(board);
    if (piecePos)
        document.getElementById("cell"+piecePos.x+piecePos.y).style.backgroundColor = (piecePos.x+piecePos.y) % 2 == 0 ? "antiquewhite" : "burlywood";
    if (board[y][x].piece != null && board[y][x].piece.color == player)
    {
        console.log("click", board[y][x].piece, x, y);
        board[y][x].piece.setPossibleMoves(board, x, y);
        last_verif_move(board, board[y][x].piece.color, {'x': x, 'y': y});
        display_possible_moves(board);
        document.getElementById("cell"+x+y).style.backgroundColor = "#dddd33";
        piecePos = {'x': x, 'y': y};
    }
}
    
function move_piece(piecePos, x, y)
{
    board[y][x].move = true;
    board[piecePos.y][piecePos.x].move = true;

    board[y][x].piece = board[piecePos.y][piecePos.x].piece;
    board[piecePos.y][piecePos.x].piece = null;
    let stock = document.getElementById("cell"+piecePos.x+piecePos.y).innerHTML;
    document.getElementById("cell"+piecePos.x+piecePos.y).innerHTML = "";
    document.getElementById("cell"+x+y).innerHTML = stock;
    piecePos = null;

    // handle en passant
    if (board[y][x].enPassant && board[y][x].piece.constructor.name == "Pawn")
    {
        let posY = 0;
        if (board[y][x].piece.color == "white")
            posY = y + 1;
        else
            posY = y - 1;
        board[posY][x].piece = null;
        document.getElementById("cell"+x+posY).innerHTML = "";
    }

    // handle castling (roque)
    if (board[y][x].castling && board[y][x].piece.constructor.name == "King")
        do_castling(board, x, y);

    //handle pawn promotion
    if (board[y][x].piece.constructor.name == "Pawn" && (y == 0 || y == 7))
    {
        board[y][x].piece = new Queen(board[y][x].piece.color)
        document.getElementById("cell"+x+y).innerHTML = ''
        let img = document.createElement("img");
        img.style.position = "absolute";
        img.src = board[y][x].piece.src;
        img.style.width = "100%";
        img.style.height = "100%";
        document.getElementById("cell"+x+y).appendChild(img);

    }

    remove_en_passant(board, board[y][x].piece.color);
}

function do_castling(board, x, y)
{
    if (x == 2)
    {
        board[y][0].move = true;
        board[y][3].move = true;
        board[y][3].piece = board[y][0].piece;
        board[y][0].piece = null;
        let stock = document.getElementById("cell0"+y).innerHTML;
        document.getElementById("cell0"+y).innerHTML = "";
        document.getElementById("cell3"+y).innerHTML = stock;
    }
    else if (x == 6)
    {
        board[y][7].move = true;
        board[y][5].move = true;
        board[y][5].piece = board[y][7].piece;
        board[y][7].piece = null;
        let stock = document.getElementById("cell7"+y).innerHTML;
        document.getElementById("cell7"+y).innerHTML = "";
        document.getElementById("cell5"+y).innerHTML = stock;
    }
}
