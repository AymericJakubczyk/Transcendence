let board = null;
let piecePos = null;
let last_move = null;
let player = "white";

function init_game()
{
    player = "white";
    whosPlaying(player);
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

function init_ranked_game(game_board, white_turn)
{
    if (white_turn)
        player = "white"
    else
        player = "black"

    board = new Array(8);
    for (let i = 0; i < 8; i++)
    {
        board[i] = new Array(8);
        for (let j = 0; j < 8; j++)
        {
            board[i][j] = new Cell();
            if (game_board[i][j].piece)
            {
                if (game_board[i][j].piece.type == "Pawn")
                    board[i][j].piece = new Pawn(game_board[i][j].piece.color);
                else if (game_board[i][j].piece.type == "Rook")
                    board[i][j].piece = new Rook(game_board[i][j].piece.color);
                else if (game_board[i][j].piece.type == "Knight")
                    board[i][j].piece = new Knight(game_board[i][j].piece.color);
                else if (game_board[i][j].piece.type == "Bishop")
                    board[i][j].piece = new Bishop(game_board[i][j].piece.color);
                else if (game_board[i][j].piece.type == "Queen")
                    board[i][j].piece = new Queen(game_board[i][j].piece.color);
                else if (game_board[i][j].piece.type == "King")
                    board[i][j].piece = new King(game_board[i][j].piece.color);
            }
        }
    }

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
                let img = document.createElement("img");
                img.style.position = "absolute";
                img.src = board[y][x].piece.src;
                img.style.width = "100%";
                img.style.height = "100%";
                document.getElementById("cell"+x+y).appendChild(img);
            }
            else
                document.getElementById("cell"+x+y).innerHTML = "";
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

function cell_click(x, y, isRanked, userColor)
{
    if (isRanked && userColor != player)
        return;
    if (board[y][x].possibleMove && piecePos)
    {
        // if it is pawn and reach last line display promotion
        if (board[piecePos.y][piecePos.x].piece.constructor.name == "Pawn" && (y == 0 || y == 7))
        {
            display_promotion(x, y, isRanked, userColor);
            return;
        }
        document.getElementById("cell"+piecePos.x+piecePos.y).style.backgroundColor = (piecePos.x+piecePos.y) % 2 == 0 ? "antiquewhite" : "burlywood";
        reset_possible_moves(board);
        if (isRanked)
        {
            chessSocket.send(JSON.stringify({
                'type': 'move',
                'from': {'x': piecePos.x, 'y': piecePos.y},
                'to': {'x': x, 'y': y}
            }));
        }
        else
        {
            move_piece(piecePos, x, y);
            piecePos = null;
            player = player == "white" ? "black" : "white";
            whosPlaying(player);
            verif_end_game(board, player);
        }
        return;
    }
    reset_possible_moves(board);
    if (piecePos)
        document.getElementById("cell"+piecePos.x+piecePos.y).style.backgroundColor = (piecePos.x+piecePos.y) % 2 == 0 ? "antiquewhite" : "burlywood";
    if (board[y][x].piece != null && board[y][x].piece.color == player)
    {
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

    // handle en passant
    // if pawn move 2 squares
    if (board[y][x].piece.constructor.name == "Pawn" && Math.abs(y - piecePos.y) == 2)
    {
        if (board[y][x].piece.color == "white")
            board[y+1][x].enPassant = true
        else
            board[y-1][x].enPassant = true
    }
    // if do an en passant
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
    if (board[y][x].piece.constructor.name == "King" && Math.abs(x - piecePos.x) == 2)
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
    update_last_move(piecePos, {'x': x, 'y': y});
    piecePos = null;
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

function update_last_move(from, to)
{
    // remove last move
    if (last_move)
    {
        document.getElementById("cell"+last_move.from.x+last_move.from.y).style.backgroundColor = (last_move.from.x+last_move.from.y) % 2 == 0 ? "antiquewhite" : "burlywood";
        document.getElementById("cell"+last_move.to.x+last_move.to.y).style.backgroundColor = (last_move.to.x+last_move.to.y) % 2 == 0 ? "antiquewhite" : "burlywood";
    } 
    // add new last move
    document.getElementById("cell"+from.x+from.y).style.backgroundColor = (from.x+from.y) % 2 == 0 ? "#ffff33" : "#eeee33";
    document.getElementById("cell"+to.x+to.y).style.backgroundColor = (to.x+to.y) % 2 == 0 ? "#ffff33" : "#eeee33";

    last_move = {'from': from, 'to': to};
}

function display_promotion(x, y, isRanked, userColor)
{
    reset_possible_moves(board);
    let promotion = document.createElement("div");
    let color = "white";
    promotion.setAttribute("id", "promotion");
    promotion.style = "display:flex; flex-direction: column; position: absolute;background-color: rgba(225, 225, 225, 0.9); border-radius: 10px;";
    promotion.style.left = x * 12.5 + "%";

    if (isRanked) 
    {
        color = userColor
        promotion.style.top = "0"
        if (userColor == "black")
            promotion.style.left = (7 - x) * 12.5 + "%"
    }
    else if (player == "black")
    {
        color = "black";
        promotion.style.bottom = "0"
        promotion.style.flexDirection = "column-reverse";
    }
    else
        promotion.style.top = "0"
    promotion.innerHTML = `
        <div class="cell" onclick="do_promotion('Queen', ${x}, ${y}, ${isRanked})" style="padding:2px">
            <img class="promotion_cell" src="/static/srcs/chess/${color}queen.svg" style="width: 100%; height: 100%; border-radius: 8px">
        </div>
        <div class="cell" onclick="do_promotion('Rook', ${x}, ${y}, ${isRanked})" style="padding:2px">
            <img class="promotion_cell" src="/static/srcs/chess/${color}rook.svg" style="width: 100%; height: 100%; border-radius: 8px">
        </div>
        <div class="cell" onclick="do_promotion('Bishop', ${x}, ${y}, ${isRanked})" style="padding:2px">
            <img class="promotion_cell" src="/static/srcs/chess/${color}bishop.svg" style="width: 100%; height: 100%; border-radius: 8px">
        </div>
        <div class="cell" onclick="do_promotion('Knight', ${x}, ${y}, ${isRanked})" style="padding:2px">
            <img class="promotion_cell" src="/static/srcs/chess/${color}knight.svg" style="width: 100%; height: 100%; border-radius: 8px">
        </div>
    `

    document.getElementById("board").appendChild(promotion);
}

function do_promotion(piece, x, y, isRanked)
{
    if (isRanked)
    {
        chessSocket.send(JSON.stringify({
            'type': 'move',
            'from': {'x': piecePos.x, 'y': piecePos.y},
            'to': {'x': x, 'y': y},
            'promotion': piece
        }));
    }
    else
    {
        move_piece(piecePos, x, y);
        do_promotion_move(piece, x, y);
        piecePos = null;
        player = player == "white" ? "black" : "white";
        whosPlaying(player);
        verif_end_game(board, player);
    }
}

function do_promotion_move(piece, x, y)
{
    if (piece == "Queen")
        board[y][x].piece = new Queen(board[y][x].piece.color);
    else if (piece == "Rook")
        board[y][x].piece = new Rook(board[y][x].piece.color);
    else if (piece == "Bishop")
        board[y][x].piece = new Bishop(board[y][x].piece.color);
    else if (piece == "Knight")
        board[y][x].piece = new Knight(board[y][x].piece.color);
    document.getElementById("cell"+x+y).children[0].src = board[y][x].piece.src;
}

function display_local_endgame(reason)
{
    elem = document.getElementById("board")
    endgame_div = document.createElement("div");
    endgame_div.setAttribute("id", "endgame");
    endgame_div.style = "position:absolute; background:rgba(50, 50, 50, 0.9);";
    endgame_div.setAttribute('class',"z-3 chess_endgame flex-column border border-secondary rounded p-3")
    endgame_div.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1>${reason}</h1>
            <a class="cancel_queue_button" hx-get hx-target="#page" hx-swap="innerHTML" hx-indicator="#content-loader">Replay</a>
        </div>
    `
    htmx.process(endgame_div)
    elem.appendChild(endgame_div);
}