function handleEnPassant(context)
{
    if (enPassant[0] != "")
	{
		if (enPassant[0].color != oldColor)
		{
			drawChess(context);
			return;
		}
		enPassant[0].enPassant = 0;
		enPassant[0].ePright = 0;
		enPassant[0] = "";
	}
	else if (enPassant[1] != "")
	{
		if (enPassant[1].color != oldColor)
		{
			drawChess(context);
			return;
		}
		enPassant[1].enPassant = 0;
		enPassant[1].enPassant = 0;
		enPassant[1] = "";
	}
}

function doRightRock(posy)
{
	selectedOne.move = 1;
	RightRock(posy);
	oldColor = selectedOne.color;
    whosPlaying(oldColor);
	selected = false;
	selectedOne = null;
}

function doLeftRock(posy)
{
	selectedOne.move = 1;
	oldColor = selectedOne.color;
    whosPlaying(oldColor);
	LeftRock(posy);
	selected = false;
	selectedOne = null;
}

function giveEnpassant(posx, posy)
{
	replaceCell(posx, posy, selectedOne);
	pieces[posx][posy] = selectedOne;
	if (posx >= 0 && posy - 1 >= 0 && isEnemyPawn(posx, posy - 1, pieces[posx][posy - 1]))
	{
		pieces[posx][posy - 1].enPassant = 1;
		pieces[posx][posy - 1].ePright = 1;
		enPassant[0] = pieces[posx][posy - 1];
	}
	if (posx >= 0 && posy + 1 < 8 && isEnemyPawn(posx, posy + 1, pieces[posx][posy + 1]))
	{   
		pieces[posx][posy + 1].enPassant = 1;
		pieces[posx][posy + 1].ePleft = 1;
		enPassant[1] = pieces[posx][posy + 1];
	}
	selectedOne.posx = posx;
	selectedOne.posy = posy;
	oldColor = selectedOne.color;
	whosPlaying(oldColor);
	pieces[oldy][oldx] = '';
	if (selectedOne.name == "King" || selectedOne.name == "Rook")
		selectedOne.count = 1;    
	selected = false;
	selectedOne = null;	
}

function doEnpassant(posy, posx)
{
	replaceCell(posy, posx, selectedOne);
    if (pieces[posy][posx] != "")
        pieces[posy][posx].alive = 1;
	if (selectedOne.color == "white")
		pieces[posy + 1][posx] = '';
	else
		pieces[posy - 1][posx] = '';
	selectedOne.enPassant = 0;
	selectedOne.ePleft = 0;
	selectedOne.ePright = 0;
	pieces[posy][posx] = selectedOne;
	selectedOne.posx = posy;
	selectedOne.posy = posx;
	oldColor = selectedOne.color;
	whosPlaying(oldColor);
	pieces[oldy][oldx] = '';
	selected = false;
	selectedOne = null;
}


function doPromotion(posy, posx, context)
{
    createNewCanvas(context);
    redrawPossibleCapture(context);
}


function createNewCanvas(context) {
    newCanvas.style.border = '3px solid #000000';
    drawProm(newctx);
    newCanvas.style.display = 'block';
    newCanvas.addEventListener('click', function(event) {selectNewPiece(event.layerX, event.layerY, newCanvas, context)}, false);
}

//MOVES
function movePiece(posy, posx)
{
    console.log(pieces);
    if (color == "black")
    {
        posx = 7 - x;
        posy = 7 - y;
    }    
	replaceCell(posy, posx, selectedOne);
    if (pieces[posy][posx] != "")
        pieces[posy][posx].alive = 1;
	pieces[posy][posx] = selectedOne;
	selectedOne.posx = posy;
	selectedOne.posy = posx;
	oldColor = selectedOne.color;
	whosPlaying(oldColor);
	pieces[oldy][oldx] = '';
	if (selectedOne.name == "King" || selectedOne.name == "Rook")
		selectedOne.count = 1;
    selectedOne.resetPossibleMove();
    if (selectedOne.name == "Pawn")
        selectedOne.getAttackMove();
    else
        selectedOne.getPossibleMove(pieces);
    console.log(pieces);
	selected = false;
	selectedOne = null;
}

function moveCheck(context, king, posy, posx)
{
    console.log("move check");
    if (selectedOne.name == "King" && selectedOne.possibleMoves[posy][posx] == "PossibleMove" && king.check[posy][posx] == "noPossibleMove" && (pieces[posy][posx].defended == 0 || pieces[posy][posx] == "") && isStillCheck(selectedOne, posy, posx, king) == false)
        movePiece(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleMove") && king.check[posy][posx] == "Checker" && isStillCheck(selectedOne, posy, posx, king) == false)
        movePiece(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleMove") && king.check[posy][posx] == "CheckMove" && isStillCheck(selectedOne, posy, posx, king) == false)
        movePiece(posy, posx, context);
    else if (selectedOne.possibleMoves[posy][posx] == "enPassant" && pieces[posy][posx].color == null && king.check[posy][posx] == "Checker" && isStillCheck(selectedOne, posy, posx, king) == false)
        doEnpassant(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleDoubleMove") && king.check[posy][posx] == "CheckMove" && selectedOne.name != "King" && isStillCheck(selectedOne, posy, posx, king) == false)
        giveEnpassant(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleDoubleMove") && king.check[posy][posx] == "CheckMove" && selectedOne.name != "King" && isStillCheck(selectedOne, posy, posx, king) == false)
        movePiece(posy, posx, context);
    else
    {
        console.log("move check out", king);
        selected = false;
        selectedOne = null;
        drawChess(context);
        return ;
    }
    king.checked = 0;
    king.resetCheck();
    console.log("move check", king);
    handleEnPassant(context);
    drawChess(context);
}

function pawnAttackCell(x, y, piece)
{
    if (0 <= x && x < 8 && 0 <= y && y < 8)
    {       
        pawnCheckAttack(x, y, piece);
    }
}

function pawnCheckAttack(x, y, piece)
{
    if (pieces[x][y] == "")
    {
        piece.possibleMoves[x][y] = "PossibleAtq";
        return ;
    }
    let posx = piece.posx;
    let posy = piece.posy;
    if (isPossible(x, y, piece) && pieces[x][y].color != piece.color)
    {   
        if (pieces[x][y].name == "King")
        {
            if (piece.alive == 0)
            {   
                pieces[x][y].check[posx][posy] = "Checker";
                pieces[x][y].checked = 1;
            }
        }
        if (piece.color == "white" && posx == 1)
            piece.possibleMoves[x][y] = "PossiblePromAtq";
        else if (piece.color == "black" && posx == 6)
            piece.possibleMoves[x][y] = "PossiblePromAtq";
        else
            piece.possibleMoves[x][y] = "PossibleMove";
        return true;
    }
    else if (pieces[x][y].color == piece.color)
    {
        piece.possibleMoves[x][y] = "PossibleDefense";
        return true;
    }
    return false;
}

function pawnCheckCell(x, y, piece)
{
    if (pieces[x][y].color != null)
        return;
    if (isPossible(x, y, piece) && pieces[x][y].color != piece.color)
    {   
        piece.possibleMoves[x][y] = "PossibleMove";
        return true;
    }
    return false;
}

function pawnCheckProm(x, y, piece)
{
    if (pieces[x][y].color != null)
        return;
    if (isPossible(x, y, piece) && pieces[x][y].color != piece.color)
    {   
        piece.possibleMoves[x][y] = "PossibleProm";
        return true;
    }
    return false;
}

function pawnCheckCellDouble(x, y, piece)
{
    if (piece.color == "white")
    {
        if (pawnCheckCell(x - 1, y, piece) == true)
        {   
            piece.possibleMoves[x - 1][y] = "PossibleMove";
            if (pawnCheckCell(x - 2, y, piece) == true)
                piece.possibleMoves[x - 2][y] = "PossibleDoubleMove";
        }
    }
    else
    {
        if (pawnCheckCell(x + 1, y, piece) == true)
        {   
            piece.possibleMoves[x + 1][y] = "PossibleMove";
            if (pawnCheckCell(x + 2, y, piece) == true)
                piece.possibleMoves[x + 2][y] = "PossibleDoubleMove";
        }
    }
}

//ROCKS
function RightRock(x)
{
    pieces[x][4].count = 1;
    pieces[x][6] = pieces[x][4];
    pieces[x][6].posx = x;
    pieces[x][6].posy = 6;
    pieces[x][4] = "NoPossibleMove";
    pieces[x][5] = pieces[x][7];
    pieces[x][5].posx = x;
    pieces[x][5].posy = 5;
    pieces[x][7] = "NoPossibleMove";
}

function LeftRock(x)
{
    pieces[x][4].count = 1;
    pieces[x][2] = pieces[x][4];
    pieces[x][2].posx = x;
    pieces[x][2].posy = 2;
    pieces[x][4] = "NoPossibleMove";
    pieces[x][3] = pieces[x][0];
    pieces[x][3].posx = x;
    pieces[x][3].posy = 3;
    pieces[x][0] = "NoPossibleMove";
}
