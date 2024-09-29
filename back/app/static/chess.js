//INIT GLOBAL VALUES
var selected = 0;
var selectedOne = null;
var oldx;
var oldy;
var newx;
var newy;
var oldColor = "black";
var enPassant = new Array(2);
var whiteKing;
var blackKing;
var newCanvas;
var newctx;
var newPiece = "init";
whosPlaying(oldColor);


//TEST
function printMousePos(event) {
    document.body.textContent =
    "clientX: " + event.clientX +
    " - clientY: " + event.clientY;
}

// MAIN GAME FUNCTION
function game(x, y, context)
{
    var width = canvas.offsetWidth;
    var size = width / 8;
    var posx = Math.floor((x / size));
    var posy = Math.floor((y / size));
    newx = posx;
    newy = posy;
    
    if (!selected)
    {
        if (pieces[posy][posx].color == oldColor)
            return ;
        if ((posy <= 8 || 0 >= posy) && (posx <= 8 || 0 >= posx))
        {
            selected = true;
            selectedOne = pieces[posy][posx];
            oldx = posx;
            oldy = posy;
            if (isChecked() == true)
                handleCheck(context, posx, posy);
            else
                drawPossibleMove(selectedOne, context);
        }
    }
    else
    {
        redrawPossibleCapture(context);
        if (!selectedOne.color)
        {
            selected = false;
            selectedOne = null;
            return ;
        }
        if (isChecked() == true && pieces[posy][posx] != selectedOne)
        {
            let king = oldColor === "white" ? blackKing : whiteKing;
            king.resetPossibleMove();
            king.getPossibleMove(pieces);
            moveCheck(context, king, posy, posx);
            return ;
        }
        selectedOne.getPossibleMove(pieces);
        if (selectedOne.possibleMoves[posy][posx] == "PossibleMove" && willBeCheck(selectedOne, posy, posx) == false)
			movePiece(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "PossibleDoubleMove" && willBeCheck(selectedOne, posy, posx) == false)
			giveEnpassant(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "RightRock" && willBeCheck(selectedOne, posy, posx) == false)
			doRightRock(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "LeftRock" && willBeCheck(selectedOne, posy, posx) == false)
			doLeftRock(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "enPassant" && willBeCheck(selectedOne, posy, posx) == false)
			doEnpassant(posy, posx, context);
        else if (selectedOne.possibleMoves[posy][posx] == "PossiblePromAtq" && willBeCheck(selectedOne, posy, posx) == false)
        {
            doPromotion(posy, posx, context);
            return ;
        }
        else if (selectedOne.possibleMoves[posy][posx] == "PossibleProm" && willBeCheck(selectedOne, posy, posx) == false)
			doPromotion(posy, posx, context);
        else
        {
            selected = false;
            selectedOne = null;
        }
        handleEnPassant(context);
		drawChess(context);
    }
}

//INIT FUNCTIONS
function initChessBoard()
{
    for (var i = 0; i < 8; i++)
        pieces[i] = new Array(8);
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
            pieces[i][j] = "";
    }
    for (let i = 0; i < 8; i++)
        pieces[1][i] = new Pawn("Pawn", "black", 1, i, "blackpawn.svg", 1);
    pieces[0][0] = new Rook("Rook", "black", 0, 0, "blackrook.svg", 1);
    pieces[0][1] = new Knight("Knight", "black", 0, 1, "blackknight.svg");
    pieces[0][2] = new Bishop("Bishop", "black", 0, 2, "blackbishop.svg");
    pieces[0][3] = new Queen("Queen", "black", 0, 3, "blackqueen.svg");
    blackKing = pieces[0][4] = new King("King", "black", 0, 4, "blackking.svg");
    pieces[0][5] = new Bishop("Bishop", "black", 0, 5, "blackbishop.svg");
    pieces[0][6] = new Knight("Knight", "black", 0, 6, "blackknight.svg");
    pieces[0][7] = new Rook("Rook", "black", 0, 7, "blackrook.svg", 2);
    for (let i = 0; i < 8; i++)
        pieces[6][i] = new Pawn("Pawn", "white", 6, i, "whitepawn.svg");
    pieces[7][0] = new Rook("Rook", "white", 7, 0, "whiterook.svg", 1);
    pieces[7][1] = new Knight("Knight", "white", 7, 1, "whiteknight.svg");
    pieces[7][2] = new Bishop("Bishop", "white", 7, 2, "whitebishop.svg");
    pieces[7][3] = new Queen("Queen", "white", 7, 3, "whitequeen.svg");
    whiteKing = pieces[7][4] = new King("King", "white", 7, 4, "whiteking.svg");
    pieces[7][5] = new Bishop("Bishop", "white", 7, 5, "whitebishop.svg");
    pieces[7][6] = new Knight("Knight", "white", 7, 6, "whiteknight.svg");
    pieces[7][7] = new Rook("Rook", "white", 7, 7, "whiterook.svg", 2);
}

function initTeams()
{
    for (let runner = 0; runner < 2; runner++)
    {
        for (let i = 0; i < 8; i++)
            blackTeam[i + runner * 8] = pieces[runner][i];
    }
    for (let runner = 6; runner < 8; runner++)
    {
        for (let i = 0; i < 8; i++)
            whiteTeam[i + (runner - 6) * 8] = pieces[runner][i];
    }
}

// "MAIN"/*

var canvas;
var ctx;
enPassant[0] = "";
enPassant[1] = "";
var pieces = new Array(8);
var whiteTeam = new Array(16);
var blackTeam = new Array(16);

function init_game()
{
    newCanvas = document.getElementById('promote');
    newctx = newCanvas.getContext('2d');
    newCanvas.style.display = "none";
    canvas = document.getElementById("chess");
    ctx = canvas.getContext("2d");
    drawCheckers(ctx);
    initChessBoard();
    initTeams();

    drawChess(ctx);
    canvas.addEventListener('click', function(event) {game(event.layerX, event.layerY, ctx)}, false);
}
