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

//PAWN UTILS
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
            pieces[x][y].check[posx][posy] = "Checker";
            pieces[x][y].checked = 1;
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

//UTILS
function isPossibleKingMove(x, y, piece)
{
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
    {   
        if (pieces[x][y].color != piece.color && isEnemyMove(x, y, piece) == false && pieces[x][y].defended == 0)
            return true;
        else if (pieces[x][y].color == null && isEnemyMove(x, y, piece) == false)
            return true;
    }
    return false;
}

function isPossible(x, y, piece)
{
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
    {   
        if (pieces[x][y].color != piece.color)
            return true;
        else if (pieces[x][y] == "")
            return true;
    }
    return false;
}

function isEnemyPawn(x, y, piece)
{
    let colour = "white";
    if (piece.color == "white")
        colour = "black";
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
        if (pieces[x][y].color != colour && pieces[x][y].name == "Pawn")
            return true;
    return false;
}

function isEnemyMove(x, y, piece)
{
    let team = oldColor === "white" ? whiteTeam : blackTeam;
    console.log(x, y);
    console.log(piece);
    console.log();
    for (let i = 0; i < 8; i++)
    {
        team[i].resetPossibleMove();
        if (team[i].name == "King")
            team[i].getPossibleNormalMove();
        else if (team[i].name == "Pawn")
        {
            team[i].getAttackMove();
        }
        else
            team[i].getPossibleMove();
        if (team[i].possibleMoves[x][y] == "PossibleMove" || team[i].possibleMoves[x][y] == "PossibleAtq")
        {
            return true;
        }
        else if (team[i].possibleMoves[x][y] == "PossibleDefense")
            return true;
    }
    return false;
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

//TEST
function printMousePos(event) {
    document.body.textContent =
    "clientX: " + event.clientX +
    " - clientY: " + event.clientY;
}

function draw(x, y, string) {	
    var count1 = x / 100;
    var count2 = y / 100;
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, x, y, 100, 100);
    };
    if (pieces[count2][count1].value != '')
        img.src = string;
}

//DRAW POSSIBLE MOVES
function drawPossibleMove(piece, ctx)
{
    if (piece == null)
        return ;
    piece.resetPossibleMove();
    piece.getPossibleMove();
    let color = piece.color;
    let colorEnemy;
    if (color == "black")
        colorEnemy = "white";
    else
        colorEnemy = "black";
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock" || piece.possibleMoves[i][j] == "PossibleDoubleMove" || piece.possibleMoves[i][j] == "PossiblePromAtq") && pieces[i][j].color == colorEnemy)
                drawPossibleCaptureMove(i, j, ctx);
            else if (piece.possibleMoves[i][j] == "enPassant" && pieces[i][j].color == null)
                drawPossibleCaptureMove(i, j, ctx);
            else if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock" || piece.possibleMoves[i][j] == "PossibleDoubleMove" || piece.possibleMoves[i][j] == "PossibleProm") && pieces[i][j].color == null)
                drawTheMove(i, j, ctx);
        }
    }
}

function drawPossibleCaptureMove(x, y, context)
{
    var width = canvas.offsetWidth;
    size = width / 8;
    const centerX = x * 100 + 50;
    const centerY = y * 100 + 50;
    const radius = 45;
    context.beginPath();
    context.arc(centerY, centerX, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'grey';
    ctx.stroke();
    context.closePath();
}

function drawTheMove(x, y, context)
{
    var width = canvas.offsetWidth;
    size = width / 8;
    const centerX = x * 100 + 50;
    const centerY = y * 100 + 50;
    const radius = 10;
    context.beginPath();
    context.arc(centerY, centerX, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'grey';
    context.fill();
    context.closePath();
}

function drawPossibleDefenseMove(context)
{
    if (selectedOne == null)
        return ;
    let king = oldColor === "white" ? blackKing : whiteKing;
    selectedOne.resetPossibleMove();
    selectedOne.getPossibleMove();
    let color = selectedOne.color;
    let colorEnemy;
    if (color == "black")
        colorEnemy = "white";
    else
        colorEnemy = "black";
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            if ((selectedOne.possibleMoves[i][j] == "PossibleMove" || selectedOne.possibleMoves[i][j] == "PossiblePromAtq") && king.check[i][j] == "Checker")
                drawPossibleCaptureMove(i, j, context);
            else if (selectedOne.possibleMoves[i][j] == "enPassant" && pieces[i][j].color == null && king.check[i][j] == "Checker")
                drawPossibleCaptureMove(i, j, context);
            else if ((selectedOne.possibleMoves[i][j] == "PossibleMove" || selectedOne.possibleMoves[i][j] == "PossibleDoubleMove" || selectedOne.possibleMoves[i][j] == "PossibleProm") && king.check[i][j] == "CheckMove" && selectedOne.name != "King")
                drawTheMove(i, j, context);
            else if (selectedOne.name == "King" && selectedOne.possibleMoves[i][j] == "PossibleMove" && king.check[i][j] == "noPossibleMove")
                drawTheMove(i, j, context);
        }
    }
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
    
    console.log(blackKing);
    console.log(whiteKing);
    console.log(pieces);
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
        console.log(selectedOne);
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
            console.log("checked");
            let king = oldColor === "white" ? blackKing : whiteKing;
            king.resetPossibleMove();
            king.getPossibleMove();
            moveCheck(context, king, posy, posx);
            return ;
        }
        selectedOne.getPossibleMove();
        console.log(selectedOne);
        if (selectedOne.possibleMoves[posy][posx] == "PossibleMove")
			movePiece(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "PossibleDoubleMove")
			giveEnpassant(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "RightRock")
			doRightRock(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "LeftRock")
			doLeftRock(posy, posx, context);
		else if (selectedOne.possibleMoves[posy][posx] == "enPassant")
			doEnpassant(posy, posx, context);
        else if (selectedOne.possibleMoves[posy][posx] == "PossiblePromAtq")
        {
            doPromotion(posy, posx, context);
            return ;
        }
        else if (selectedOne.possibleMoves[posy][posx] == "PossibleProm")
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

function moveCheck(context, king, posy, posx)
{
    if ((selectedOne.possibleMoves[posy][posx] == "PossibleMove") && king.check[posy][posx] == "Checker")
        movePiece(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleMove") && king.check[posy][posx] == "CheckMove")
        movePiece(posy, posx, context);
    else if (selectedOne.possibleMoves[posy][posx] == "enPassant" && pieces[posy][posx].color == null && king.check[posy][posx] == "Checker")
        doEnpassant(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleDoubleMove") && king.check[posy][posx] == "CheckMove" && selectedOne.name != "King")
        giveEnpassant(posy, posx, context);
    else if ((selectedOne.possibleMoves[posy][posx] == "PossibleDoubleMove") && king.check[posy][posx] == "CheckMove" && selectedOne.name != "King")
        movePiece(posy, posx, context);
    else if (selectedOne.name == "King" && selectedOne.possibleMoves[posy][posx] == "PossibleMove" && king.check[posy][posx] == "noPossibleMove")
        movePiece(posy, posx, context);
    else
    {
        selected = false;
        selectedOne = null;
        drawChess(context);
        return ;
    }
    king.checked = 0;
    king.resetCheck();
    handleEnPassant(context);
    drawChess(context);
}

function handleCheck(context, posx, posy)
{
    let king = oldColor === "white" ? blackKing : whiteKing;
    if (isCheckMate())
    {
        console.log("I AM CHECKEDMATED");
        alert("YOU GOT CHECKMATED");
    }
    if (isDefendable() == false)
    {
        selected = false;
        selectedOne = null;
        drawChess(context);
        return ;
    }
    else
        drawPossibleDefenseMove(context);
    return ;
}

function isDefendable()
{
    let king = (oldColor === "white" ? blackKing : whiteKing);
    selectedOne.getPossibleMove();
    for (let x = 0; x < 8; x++)
    {
        for (let y = 0; y < 8; y++)
        {
            if (selectedOne.possibleMoves[x][y] == "PossibleMove" && (king.check[x][y] == "CheckMove" || king.check[x][y] == "Checker"))
            {
                return true;
            }
            else if (selectedOne.name == "King" && selectedOne.possibleMoves[x][y] == "PossibleMove" && selectedOne.check[x][y] == "noPossibleMove")
                return true;
        }
    }
    return false;
}

function isCheckMate()
{
    console.log("ISCHECKMATE");
    let team = oldColor === "white" ? blackTeam : whiteTeam;
    let king = oldColor === "white" ? blackKing : whiteKing;
    if (canKingMove(king))
        return false;
    console.log("move");
    if (canSomeoneBlock(team, king))
        return false;
    console.log("block");
    if (canSomeoneDefend(team, king))
        return false;
    console.log("defend");
    return true;
}

function canSomeoneDefend(team, king)
{
    for (let i = 0; i < 16; i++)
    {
        if (team[i].name != "King")
            team[i].getPossibleMove();
        if (team[i].name == "Pawn")
            team[i].getAttackMove();
        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                if (team[i].possibleMoves[x][y] == "PossibleMove" && (king.check[x][y] == "Checker"))
                    return true;
            }
        }
    }
    return false;
}

function canSomeoneBlock(team, king)
{
    for (let i = 0; i < 16; i++)
    {
        if (team[i].name != "King")
            team[i].getPossibleMove();
        if (team[i].name == "Pawn")
            team[i].getAttackMove()
        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                if (team[i].possibleMoves[x][y] == "PossibleMove" && (king.check[x][y] == "CheckMove") && isStillCheck(team[i], x, y) == false)
                    return true;
            }
        }
    }
    return false;
}

function isStillCheck(piece, newx, newy)
{
    var newTab = new Array(8);
    for (let i = 0; i < 8; i++)
    {
        newTab[i] = new Array(8);
        for (let j = 0; j < 8; j++)
        {
            newTab[i][j] = pieces[i][j];
        }
    }
    newTab[piece.posx][piece.posy] = "";
    newTab[newx][newy] = piece;
    for (let i = 0; i < 8; i++)
        delete newTab[i];
    delete newTab;
}

function canKingMove(king)
{
    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            if (king.possibleMoves[i][j] == "PossibleMove" && king.check[i][j] == "noPossibleMove")
                return true;
        }
    }
    return false;
}

function isChecked()
{
    let color = oldColor === "white" ? "black" : "white";
    let team = color === "white" ? whiteTeam : blackTeam;
    let king = oldColor === "white" ? blackKing : whiteKing;
    for (let i = 0; i< 16; i++)
    {
        if (team[i].name == "Pawn")
            team[i].getAttackMove();
        else
            team[i].getPossibleMove();
    }
    if (king.checked == 1)
        return true;
    return false;
}

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

//MOVES
function movePiece(posy, posx)
{
	replaceCell(posy, posx, selectedOne);
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
        selectedOne.getPossibleMove();
	selected = false;
	selectedOne = null;
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
    console.log("PROMOTION");
    createNewCanvas(context);
    redrawPossibleCapture(context);
}

function replacePiece(posy, posx, context, newCanvas)
{
    var team = oldColor === "white" ? blackTeam : whiteTeam;
    let color = oldColor === "white" ? "black" : "white";
    var tmp;
    console.log(newPiece);
    if (newPiece == "init")
        return ;
    if (newPiece == "queen")
        tmp = new Queen("Queen", color, newy, newx, color+"queen.svg");
    else if (newPiece == "knight")
        tmp = new Knight("Knight", color, newy, newx, color+"knight.svg");
    else if (newPiece == "rook")
        tmp = new Rook("Rook", color, newy, newx, color+"rook.svg");
    else if (newPiece == "bishop")
        tmp = new Bishop("Bishop", color, newy, newx, color+"bishop.svg");
    findAndReplace(team, tmp, context, newCanvas);
}

function findAndReplace(team, tmp, context, newCanvas)
{
    let pos;
    if (selectedOne == null)
        return ;
    for (let i = 0; i < 16; i++)
    {
        if (team[i] == selectedOne)
        {
            pos = i;
            pieces[oldy][oldx] = "";
            pieces[newy][newx] = "";
            team[i] = tmp;
            break;
        }
    }
    drawChess(context);
    pieces[newy][newx] = tmp;
    if (newCanvas)
        newCanvas.style.display = 'none';
    pieces[newy][newx].getPossibleMove();
    oldColor = selectedOne.color;
	whosPlaying(oldColor);
    selected = false;
    selectedOne = null;
    drawChess(context);
    return ;
}

function createNewCanvas(context) {
    newCanvas.style.border = '3px solid #000000';
    drawProm(newctx);
    newCanvas.style.display = 'block';
    newCanvas.addEventListener('click', function(event) {selectNewPiece(event.layerX, event.layerY, newCanvas, context)}, false);
    // canvas.addEventListener('click', function() {game(event.layerX, event.layerY, ctx)}, false);
}

function selectNewPiece(x, y, newCanvas, context)
{
    var width = newCanvas.offsetWidth;
    var size = 50;
    var posx = Math.floor((x / size));
    var posy = Math.floor((y / size));
    
    if (posx == 0 && posy == 0)
        newPiece = "queen";
    else if (posx == 0 && posy == 1)
        newPiece = "knight"
    else if (posx == 1 && posy == 0)
        newPiece = "rook";
    else if (posx == 1 && posx == 1)
        newPiece = "bishop";
    replacePiece(posy, posx, context, newCanvas);
}

function drawProm(newctx)
{
    let color = oldColor === "white" ? "black" : "white";
    let arr = [];
    arr[0] = "/static/srcs/chess/" + color + "queen.svg";
    arr[1] = "/static/srcs/chess/" + color + "knight.svg";
    arr[2] = "/static/srcs/chess/" + color + "rook.svg";
    arr[3] = "/static/srcs/chess/" + color + "bishop.svg";
    let count = 0;
    for(let i= 0;i < 100; i+=50) 
    {
        for (let j = 0; j < 100; j+=50)
        {
            drawPromPieces(i, j, arr[count], newctx);
            newctx.fillStyle = "beige";
            newctx.fillRect(i, j, 50, 50);
            if (i != 0)
            {   
                newctx.fillStyle = "black";
                newctx.fillRect(i, j, 3, 50);
            }
            count++;
        }
        newctx.fillStyle = "black";
        newctx.fillRect(i, 50, 50, 3);
    }
}

function drawPromPieces(x, y, string, newctx) {	
    const img = new Image();
    img.src = string;
    img.onload = () => {
        newctx.drawImage(img, x, y, 50, 50);
    };
}

//REDRAW MOVES OR REPLACE CELLS
function replaceCell(x, y, piece)
{
    let count = y + x + 1;
    ctx.fillStyle = "burlywood";
    if (count % 2 == 1)
        ctx.fillStyle = "antiquewhite";
    ctx.fillRect(y * 100, x * 100, 100, 100);
    if (piece)
        draw(y * 100, x * 100, "/static/srcs/chess/" + piece.img);
}

function redrawPossibleCapture(context)
{
    let color = selectedOne.color;
    let colorEnemy;
    if (color == "black")
        colorEnemy = "white";
    else
        colorEnemy = "black";
    if (!selectedOne.color)
        return ;
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            if ((selectedOne.possibleMoves[i][j] == "PossibleMove" || selectedOne.possibleMoves[i][j] == "PossiblePromAtq") && pieces[i][j].color == colorEnemy)
            {   
                reDrawPossibleCaptureMove(i, j, context);
            }
        }
    }
}

function reDrawPossibleCaptureMove(x, y, context)
{
    let count = y + x + 1;
    if (count % 2 == 1)
        ctx.strokeStyle = 'antiquewhite';
    else
        ctx.strokeStyle = 'burlywood';
    var width = canvas.offsetWidth;
    size = width / 8;
    const centerX = x * 100 + 50;
    const centerY = y * 100 + 50;
    const radius = 45;
    context.beginPath();
    context.arc(centerY, centerX, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 6;
    ctx.stroke();
    context.closePath();
}


//CLASSIC DRAW FUNCTIONS
function drawChess(ctx)
{
    var count = 0;
    const arrV = ['8', '7', '6', '5', '4', '3', '2', '1'];
	const arrC = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    ctx.font = '16px Arial';
    for(let i= 0;i < 800; i+=100) 
    {
        count++;
        for (let j = 0; j < 800; j+=100)
        {
            var pos = i + j + 150;
            var count1 = i / 100;
            var count2 = j / 100;
            if (pieces[count2][count1].color != null)
                draw(i, j, "/static/srcs/chess/" + pieces[count2][count1].img);
            else if (count % 2 == 1)
            {
                ctx.fillStyle = "antiquewhite";
                ctx.fillRect(i, j, 100, 100);
            }
            else if (count % 2 == 0)
            {
                ctx.fillStyle = "burlywood";
                ctx.fillRect(i, j, 100, 100);
            }
            if (count % 2 == 1)
                ctx.fillStyle = "burlywood";
            else if (count % 2 == 0)
                ctx.fillStyle = "antiquewhite";
            if (j == 700)
                ctx.fillText(arrC[i / 100], i + 90, j + 95);
            if (i == 0)
                ctx.fillText(arrV[j / 100], i + 3, j + 15);
            count++;
        }
    }
}

function drawCheckers(ctx)
{
    const arrV = ['8', '7', '6', '5', '4', '3', '2', '1'];
	const arrC = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    var count = 0;
    ctx.font = '16px Arial';
    for(var i= 0;i < 800; i+=100) 
    {
        count++;
        for (var j = 0; j < 800; j+=100)
        {
            var pos = i + j + 150;
            if (count % 2 == 1)
            {
                ctx.fillStyle = "antiquewhite";
                ctx.fillRect(i, j, 100, 100);
            }
            else if (count % 2 == 0)
            {
                ctx.fillStyle = "burlywood";
                ctx.fillRect(i, j, 100, 100);
            }
            if (count % 2 == 1)
                ctx.fillStyle = "antiquewhite";
            else if (count % 2 == 0)
                ctx.fillStyle = "burlywood";
            if (j == 700)
                ctx.fillText(arrC[i / 100], i + 90, j + 95);
            if (i == 0)
                ctx.fillText(arrV[j / 100], i + 3, j + 15);
            count++;
        }
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
