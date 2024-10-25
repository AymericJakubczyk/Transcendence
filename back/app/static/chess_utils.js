var color;
console.log(username);
// if (username.sender == white)
//     color = "white";
// else
//     color = "black";

function isPossibleKingMove(x, y, piece)
{
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
    {   
        if (pieces[x][y].color != piece.color && isEnemyMove(x, y, piece) == false && pieces[x][y].defended == 0)
            return true;
        else if (pieces[x][y].color == null && isEnemyMove(x, y, piece) == false)
            return true;
        else if (pieces[x][y].color == piece.color)
            pieces[x][y].defended = 1;
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
    for (let i = 0; i < 16; i++)
    {
        if (team[i].alive == 1)
            continue ;
        team[i].resetPossibleMove();
        if (team[i].name == "King")
            team[i].getPossibleNormalMove();
        else if (team[i].name == "Pawn")
        {
            team[i].getAttackMove();
        }
        else
            team[i].getPossibleMove(pieces);
        if (team[i].possibleMoves[x][y] == "PossibleMove" || team[i].possibleMoves[x][y] == "PossibleAtq")
        {
            return true;
        }
        else if (team[i].possibleMoves[x][y] == "PossibleDefense")
            return true;
    }
    return false;
}

function getEnemyMoves()
{
    let team = oldColor === "white" ? blackTeam : whiteTeam;
    for (let i = 0; i < 16; i++)
    {
        if (team[i].alive == 1)
            continue ;
        if (team[i].name == "Pawn")
            team[i].getAttackMove(pieces);
        else
            team[i].getPossibleMove(pieces);
    }
}

function handleCheck(context, posx, posy)
{
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
    selectedOne.getPossibleMove(pieces);
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

function isPat()
{
    for (let i = 0; i < 16; i++)
    {
        if (whiteTeam[i].alive == 0 && whiteTeam[i].name != "King")
        {
            whiteTeam[i].getPossibleMove(pieces);
            if (whiteTeam[i].canMove == 1)
                return false;
        }
    }
    for (let i = 0; i < 16; i++)
    {
        if (blackTeam[i].alive == 0 && blackTeam[i].name != "King")
        {
            blackTeam[i].getPossibleMove(pieces);
            if (blackTeam[i].canMove == 1)
                return false;
        }
    }
    return true;
}

function isCheckMate()
{
    let team = oldColor === "white" ? blackTeam : whiteTeam;
    let king = oldColor === "white" ? blackKing : whiteKing;
    if (isChecked() == false)
        return false;
    if (canKingMove(king))
        return false;
    if (canSomeoneBlock(team, king))
        return false;
    if (canSomeoneDefend(team, king))
        return false;
    return true;
}

function canSomeoneDefend(team, king)
{
    for (let i = 0; i < 16; i++)
    {
        if (team[i].alive == 1)
            continue ;
        if (team[i].name != "King")
            team[i].getPossibleMove(pieces);
        if (team[i].name == "Pawn")
            team[i].getAttackMove();
        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                if (team[i].alive == 0 && team[i].possibleMoves[x][y] == "PossibleMove" && (king.check[x][y] == "Checker") && isStillCheck(team[i], x, y, king) == false)
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
        if (team[i].alive == 1)
            continue ;
        if (team[i].name != "King")
            team[i].getPossibleMove(pieces);
        if (team[i].name == "Pawn")
            team[i].getAttackMove()
        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                if (team[i].name != "King" && team[i].possibleMoves[x][y] == "PossibleMove" && king.check[x][y] == "CheckMove" && isStillCheck(team[i], x, y, king) == false)
                {
                    return true;
                }
            }
        }
    }
    return false;
}

function willBeCheck(piece, newx, newy)
{
    let king = oldColor === "white" ? blackKing : whiteKing;
    let kingposx = king.posx;
    let kingposy = king.posy;
    var newTab = new Array(8);
    for (let i = 0; i < 8; i++)
    {
        newTab[i] = new Array(8);
        for (let j = 0; j < 8; j++)
        {
            newTab[i][j] = "";
            newTab[i][j] = pieces[i][j];
        }
    }
    pieces[newx][newy].alive = 1;
    newTab[piece.posx][piece.posy] = "";
    newTab[newx][newy] = piece;
    let team = oldColor === "white" ? whiteTeam : blackTeam;
    for (let i = 0; i < 16; i++)
    {
        team[i].resetPossibleMove();
        if (team[i].name == "Pawn")
            team[i].getAttackMove();
        else
        {
            team[i].getPossibleMove(newTab);
        }
        if (team[i].alive == 0 && team[i].possibleMoves[kingposx][kingposy] == "PossibleMove")
        {
            king.checked = 0;
            king.resetCheck();
			pieces[newx][newy].alive = 0;
            return true;
        }
        team[i].resetPossibleMove();
    }
    pieces[newx][newy].alive = 0;
    return false;
}

function isStillCheck(piece, newx, newy, king)
{
    let kingposx = king.posx;
    let kingposy = king.posy;
    var newTab = new Array(8);
    for (let i = 0; i < 8; i++)
    {
        newTab[i] = new Array(8);
        for (let j = 0; j < 8; j++)
        {
            newTab[i][j] = "";
            newTab[i][j] = pieces[i][j];
        }
    }
    pieces[newx][newy].alive = 1;
    newTab[piece.posx][piece.posy] = "";
    newTab[newx][newy] = piece;
    var newteam = new Array(16);
    let count = 0;
    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            if (newTab[i][j] != "")
            {
                if (newTab[i][j].color == oldColor)
                {
                    newteam[count] = newTab[i][j];
                    count++;
                }
            }
        }
    }
    for (let i = 0; i < 16; i++)
    {
        if (newteam[i] == null)
            continue ;
        if (newteam[i].alive == 1)
            continue ;
        newteam[i].resetPossibleMove();
        if (newteam[i].name == "Pawn")
            newteam[i].getAttackMove();
        else
            newteam[i].getPossibleMove(newTab);
        if (newteam[i].alive == 0 && newteam[i].possibleMoves[kingposx][kingposy] == "PossibleMove")
        {
            newTab[newx][newy].alive = 0;
            return true;        
        }
        newteam[i].resetPossibleMove();
    }
    pieces[newx][newy].alive = 0;
    return false;
}

function canKingMove(king)
{
    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            if (king.possibleMoves[i][j] == "PossibleMove" && king.check[i][j] == "noPossibleMove")
            {
                if (pieces[i][j] != "" && pieces[i][j].defended == 1)
                    continue ;
                return true;
            }
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
        if (team[i].alive == 1)
			continue ;
        else if (team[i].name == "Pawn")
            team[i].getAttackMove();
        else
            team[i].getPossibleMove(pieces);
    }
    if (king.checked == 1)
        return true;
    return false;
}

function replacePiece(posy, posx, context, newCanvas)
{
    var team = oldColor === "white" ? blackTeam : whiteTeam;
    let color = oldColor === "white" ? "black" : "white";
    var tmp;
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
    if (pieces[oldy][oldx] != "")
        pieces[oldy][oldx].alive = 1;
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
    pieces[newy][newx].getPossibleMove(pieces);
    oldColor = selectedOne.color;
	whosPlaying(oldColor);
    selected = false;
    selectedOne = null;
    drawChess(context);
    return ;
}

function selectNewPiece(x, y, newCanvas, context)
{
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

//TEST
function printMousePos(event) {
    document.body.textContent =
    "clientX: " + event.clientX +
    " - clientY: " + event.clientY;
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
    if (color == "black")
        initBlack();
    else
        initWhite();
}

function initBlack()
{
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

function initWhite()
{
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
    initOrder();
}

function findPiece(name, team, count)
{
    let ind = 0;
    for (let i = 0; i < 16; i++)
    {
        if (team[i].name == name)
        {
            if (count == ind)
                return team[i];
            else
                ind++;
        }
    }
    return null;
}

function initOrder()
{
    whiteOrder[0] = findPiece("Queen", whiteTeam, 0);
    whiteOrder[1] = findPiece("Rook", whiteTeam, 0);
    whiteOrder[2] = findPiece("Rook", whiteTeam, 1);
    whiteOrder[3] = findPiece("Bishop", whiteTeam, 0);
    whiteOrder[4] = findPiece("Bishop", whiteTeam, 1);
    whiteOrder[5] = findPiece("Knight", whiteTeam, 0);
    whiteOrder[6] = findPiece("Knight", whiteTeam, 1);
    whiteOrder[7] = findPiece("Pawn", whiteTeam, 0);
    whiteOrder[8] = findPiece("Pawn", whiteTeam, 1);
    whiteOrder[9] = findPiece("Pawn", whiteTeam, 2);
    whiteOrder[10] = findPiece("Pawn", whiteTeam, 3);
    whiteOrder[11] = findPiece("Pawn", whiteTeam, 4);
    whiteOrder[12] = findPiece("Pawn", whiteTeam, 5);
    whiteOrder[13] = findPiece("Pawn", whiteTeam, 6);
    whiteOrder[14] = findPiece("Pawn", whiteTeam, 7);
    
    blackOrder[0] = findPiece("Queen", blackTeam, 0);
    blackOrder[1] = findPiece("Rook", blackTeam, 0);
    blackOrder[2] = findPiece("Rook", blackTeam, 1);
    blackOrder[3] = findPiece("Bishop", blackTeam, 0);
    blackOrder[4] = findPiece("Bishop", blackTeam, 1);
    blackOrder[5] = findPiece("Knight", blackTeam, 0);
    blackOrder[6] = findPiece("Knight", blackTeam, 1);
    blackOrder[7] = findPiece("Pawn", blackTeam, 0);
    blackOrder[8] = findPiece("Pawn", blackTeam, 1);
    blackOrder[9] = findPiece("Pawn", blackTeam, 2);
    blackOrder[10] = findPiece("Pawn", blackTeam, 3);
    blackOrder[11] = findPiece("Pawn", blackTeam, 4);
    blackOrder[12] = findPiece("Pawn", blackTeam, 5);
    blackOrder[13] = findPiece("Pawn", blackTeam, 6);
    blackOrder[14] = findPiece("Pawn", blackTeam, 7);
}