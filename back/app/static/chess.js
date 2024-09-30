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
