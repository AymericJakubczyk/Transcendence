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
    if (isCheckMate())
    {
        alert(oldColor + " won the game");
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

function isCheckMate()
{
    let team = oldColor === "white" ? blackTeam : whiteTeam;
    let king = oldColor === "white" ? blackKing : whiteKing;
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
                if (team[i].name != "King" && team[i].possibleMoves[x][y] == "PossibleMove" && (king.check[x][y] == "CheckMove") && isStillCheck(team[i], x, y, king) == false)
                    return true;
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
			pieces[newx][newy].alive = 0;
            return true;        
        }
        team[i].resetPossibleMove();
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
