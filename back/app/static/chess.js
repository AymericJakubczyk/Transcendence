//INIT GLOBAL VALUES
var selected = false;
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
    if (color == "black")
    {
        posx = 7 - posx;
        posy = 7 - posy;
    }
    newx = posx;
    newy = posy;
    
    if (isPat() == true)
    {
        alert("Pat");
        return ;
    }
    if (!selected)
    {
        if (isCheckMate() == true)
        {
            console.log("End game test");
            canvas.removeEventListener('click', chessClickListener, false);  
            document.getElementById("endgame").style.display = 'block';
            document.getElementById("endgame").style.position = "static";
            document.getElementById("endgame").style.heigth = "400";
            document.getElementById("endgame").style.width = "400";
            document.getElementById("chess").style.display = "none";
            document.getElementById("WhitePlayer").style.display = "none";
            document.getElementById("BlackPlayer").style.display = "none";
            // document.getElementById("winner").style.display = "inline";
            // document.getElementById("loser").style.display = "inline";
        }
        if (pieces[posy][posx].color == oldColor)
            return ;
        if ((posy <= 8 || 0 >= posy) && (posx <= 8 || 0 >= posx))
        {
            console.log("HERE", pieces, posy, posx);
            selected = true;
            selectedOne = pieces[posy][posx];
            oldx = posx;
            oldy = posy;
            selectedOne.getPossibleMove(pieces);
            if (isChecked() == true)
                handleCheck(context, posx, posy);
            else
                drawPossibleMove(selectedOne, context);
        }
    }
    else
    {
        let king = oldColor === "white" ? blackKing : whiteKing;
        redrawPossibleCapture(context);
        if (!selectedOne.color)
        {
            selected = false;
            selectedOne = null;
            return ;
        }
        if (isChecked() == true && pieces[posy][posx] != selectedOne)
        {
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
        king.resetCheck();
        handleEnPassant(context);
		drawChess(context);
        
        
        
        //SEND MOVE TO SERVER  oldx oldy newx newy
        //SEND MOVE TO SERVER  oldx oldy newx newy
        
        
        
    }
}

// "MAIN"/*

var canvas;
var ctx;
enPassant[0] = "";
enPassant[1] = "";
var color;
var pieces = new Array(8);
var whiteTeam = new Array(16);
var blackTeam = new Array(16);
const chessClickListener = function(event) {game(event.layerX, event.layerY, ctx)};

function reset_game()
{
    delete pieces;
    delete whiteTeam;
    delete blackTeam;
    oldColor = "black";
    document.getElementById("endgame").style.display = "none";
    document.getElementById("chess").style.display = "block";
    init_game();
}

function init_game()
{
    if (username != null)
    {
        console.log(username.sender);   
        if (username.sender == black)
        {
            color = "black";
            oldColor = "black";
        }
        else
            color = "white";
    }
    console.log(white);
    console.log(black);
    console.log("color: " + color);
    newCanvas = document.getElementById('promote');
    newctx = newCanvas.getContext('2d');
    newCanvas.style.display = "none";
    canvas = document.getElementById("chess");
    ctx = canvas.getContext("2d");
    drawCheckers(ctx);
    initChessBoard();
    initTeams();
    drawChess(ctx);
    canvas.addEventListener('click', chessClickListener, false);
}
