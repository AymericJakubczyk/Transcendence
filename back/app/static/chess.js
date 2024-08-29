//INIT GLOBAL VALUES
var selected = 0;
var selectedOne = null;
var oldx;
var oldy;
var oldColor = "black";
var enPassant = new Array(2);
var whiteKing;
var blackKing;
whosPlaying(oldColor);

class Pawn {
    constructor (name, color, posx, posy, img)
    {
        this.enPassant = 0;
        this.ePleft = 0;
        this.ePright = 0;
        this.name = name;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.img = img;
        this.isSelected = 0;
        this.possibleMoves = [];
        for (var i = 0; i < 8; i++)
        {
            this.possibleMoves[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
    getPossibleMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        console.log(this.enPassant, " PASADO");
        if (this.color == "white")
        {
            if (posx == 6)
                pawnCheckCellDouble(posx, posy, this);
            if (this.enPassant == 1)
            {
                if (this.ePright == 1)
                {
                    if (isPossible(posx - 1, posy + 1, this) && pieces[posx - 1][posy + 1].color == null)
                        this.possibleMoves[posx - 1][posy + 1] = "enPassant";
                }
                if (this.ePleft == 1)
                {
                    if (isPossible(posx - 1, posy - 1, this) && pieces[posx - 1][posy - 1].color == null)
                        this.possibleMoves[posx - 1][posy - 1] = "enPassant";
                }
            }
            pawnCheckCell(posx - 1, posy, this);
            this.getAttackMove();
        }
        else
        {
            if (posx == 1)
                pawnCheckCellDouble(posx, posy, this);
            if (this.enPassant == 1)
            {
                if (this.ePright == 1)
                {
                    if (isPossible(posx + 1, posy + 1, this) && pieces[posx + 1][posy + 1].color == null)
                        this.possibleMoves[posx + 1][posy + 1] = "enPassant";
                }
                if (this.ePleft == 1)
                {
                    if (isPossible(posx + 1, posy - 1, this) && pieces[posx + 1][posy - 1].color == null)
                        this.possibleMoves[posx + 1][posy - 1] = "enPassant";
                }
            }
            pawnCheckCell(posx + 1, posy, this);
            this.getAttackMove();
        }
        console.log(this.possibleMoves);
    }
    getAttackMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        if (this.color == "white")
        {
            pawnAttackCell(posx - 1, posy - 1, this);
            pawnAttackCell(posx - 1, posy + 1, this);
        }
        else
        {
            pawnAttackCell(posx + 1, posy - 1, this);
            pawnAttackCell(posx + 1, posy + 1, this);
        }
    }
    resetPossibleMove()
    {
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
}

class Knight {
    constructor (name, color, posx, posy, img)
    {
        this.name = name;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.img = img;
        this.isSelected = 0;
        this.possibleMoves = [];
        for (var i = 0; i < 8; i++)
        {
            this.possibleMoves[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
    getPossibleMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        checkCell(posx + 2, posy + 1, this);
        checkCell(posx + 2, posy - 1, this);

        checkCell(posx - 2, posy + 1, this);
        checkCell(posx - 2, posy - 1, this);

        checkCell(posx + 1, posy + 2, this);
        checkCell(posx - 1, posy + 2, this);
 
        checkCell(posx + 1, posy - 2, this);
        checkCell(posx - 1, posy - 2, this);
    }
    resetPossibleMove()
    {
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
}

class Rook {
    constructor (name, color, posx, posy, img, id)
    {
        this.id = id;
        this.name = name;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.img = img;
        this.count = 0;
        this.isSelected = 0;
        this.possibleMoves = [];
        for (var i = 0; i < 8; i++)
        {
            this.possibleMoves[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
    getPossibleMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        console.log(posx, posy);
        for (let i = posx + 1; i < 8; i++)
        {
            if (checkCell(i, posy, this) == false)
                break;
        }
        for (let i = posx - 1; i >= 0; i--)
        {
            if (checkCell(i, posy, this) == false)
                break;
        }
        for (let i = posy + 1; i < 8; i++)
        {
            if (checkCell(posx, i, this) == false)
                break;
        }
        for (let i = posy - 1; i >= 0; i--)
        {
            if (checkCell(posx, i, this) == false)
                break;
        }
    }
    resetPossibleMove()
    {
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
}

class Bishop {
    constructor (name, color, posx, posy, img)
    {
        this.name = name;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.img = img;
        this.isSelected = 0;
        this.possibleMoves = [];
        for (var i = 0; i < 8; i++)
        {
            this.possibleMoves[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
    getPossibleMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        for (let x = this.posx + 1, y = this.posy + 1; x < 8 && y < 8; x++, y++)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
        for (let x = this.posx + 1, y = this.posy - 1; x < 8 && y >= 0; x++, y--)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
        for (let x = this.posx - 1, y = this.posy + 1; x >= 0 && y < 8; x--, y++)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
        for (let x = this.posx - 1, y = this.posy - 1; x >= 0 && y >= 0; x--, y--)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
    }
    resetPossibleMove()
    {
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
}

class King {
    constructor (name, color, posx, posy, img)
    {
        this.count = 0;
        this.checked = 0;
        this.name = name;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.img = img;
        this.isSelected = 0;
        this.possibleMoves = [];
        for (var i = 0; i < 8; i++)
        {
            this.possibleMoves[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
        this.check = [];
        for (var i = 0; i < 8; i++)
        {
            this.check[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.check[i][j] = "noPossibleMove";
        }
    }
    getPossibleMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        
        console.log(posx, posy);
        if (this.count == 0)
            if (isPossibleKingMove(posx, 5, this) && isPossibleKingMove(posx, 6, this) && pieces[posx][7].id == 2 && pieces[posx][7].count == 0 && this.count == 0)
                this.possibleMoves[posx][6] = "RightRock";
            if (isPossibleKingMove(posx, 1, this) && isPossibleKingMove(posx, 2, this) && isPossibleKingMove(posx, 3, this) && pieces[posx][0].id == 1 && pieces[posx][0].count == 0 && this.count == 0)
                this.possibleMoves[posx][2] = "LeftRock";
        if (isPossibleKingMove(posx - 1, posy - 1, this) == true)
            this.possibleMoves[posx - 1][posy - 1] = "PossibleMove";
        if (isPossibleKingMove(posx - 1, posy, this) == true)
            this.possibleMoves[posx - 1][posy] = "PossibleMove";
        if (isPossibleKingMove(posx - 1, posy + 1, this) == true)
            this.possibleMoves[posx - 1][posy + 1] = "PossibleMove";
        if (isPossibleKingMove(posx + 1, posy - 1, this) == true)
            this.possibleMoves[posx + 1][posy - 1] = "PossibleMove";
        if (isPossibleKingMove(posx + 1, posy, this) == true)
            this.possibleMoves[posx + 1][posy] = "PossibleMove";
        if (isPossibleKingMove(posx + 1, posy + 1, this) == true)
            this.possibleMoves[posx + 1][posy + 1] = "PossibleMove";   
        if (isPossibleKingMove(posx, posy + 1, this) == true)
            this.possibleMoves[posx][posy + 1] = "PossibleMove";
        if (isPossibleKingMove(posx , posy - 1, this) == true)
            this.possibleMoves[posx][posy - 1] = "PossibleMove";
    }
    getPossibleNormalMove()
    {
        let posx = this.posx;
        let posy = this.posy;
        
        console.log(posx, posy);
        if (this.count == 0)
            if (isPossible(posx, 5, this) && isPossible(posx, 6, this) && pieces[posx][7].id == 2 && pieces[posx][7].count == 0 && this.count == 0)
                this.possibleMoves[posx][6] = "RightRock";
            if (isPossible(posx, 1, this) && isPossible(posx, 2, this) && isPossible(posx, 3, this) && pieces[posx][0].id == 1 && pieces[posx][0].count == 0 && this.count == 0)
                this.possibleMoves[posx][2] = "LeftRock";
        if (isPossible(posx - 1, posy - 1, this) == true)
            this.possibleMoves[posx - 1][posy - 1] = "PossibleMove";
        if (isPossible(posx - 1, posy, this) == true)
            this.possibleMoves[posx - 1][posy] = "PossibleMove";
        if (isPossible(posx - 1, posy + 1, this) == true)
            this.possibleMoves[posx - 1][posy + 1] = "PossibleMove";
        if (isPossible(posx + 1, posy - 1, this) == true)
            this.possibleMoves[posx + 1][posy - 1] = "PossibleMove";
        if (isPossible(posx + 1, posy, this) == true)
            this.possibleMoves[posx + 1][posy] = "PossibleMove";
        if (isPossible(posx + 1, posy + 1, this) == true)
            this.possibleMoves[posx + 1][posy + 1] = "PossibleMove";   
        if (isPossible(posx, posy + 1, this) == true)
            this.possibleMoves[posx][posy + 1] = "PossibleMove";
        if (isPossible(posx , posy - 1, this) == true)
            this.possibleMoves[posx][posy - 1] = "PossibleMove";
    }
    resetPossibleMove()
    {
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
}

class Queen {
    constructor (name, color, posx, posy, img)
    {
        this.name = name;
        this.color = color;
        this.posx = posx;
        this.posy = posy;
        this.img = img;
        this.isSelected = 0;
        this.possibleMoves = [];
        for (var i = 0; i < 8; i++)
        {
            this.possibleMoves[i] = new Array(8);
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
    getPossibleMove()
    {
        console.log(pieces);
        let posx = this.posx;
        let posy = this.posy;
        for (let i = posx + 1; i < 8; i++)
        {
            if (checkCell(i, posy, this) == false)
                break;
        }
        for (let i = posx - 1; i >= 0; i--)
        {
            if (checkCell(i, posy, this) == false)
                break;
        }
        for (let i = posy + 1; i < 8; i++)
        {
            if (checkCell(posx, i, this) == false)
                break;
        }
        for (let i = posy - 1; i >= 0; i--)
        {
            if (checkCell(posx, i, this) == false)
                break;
        }
        for (let x = this.posx + 1, y = this.posy + 1; x < 8 && y < 8; x++, y++)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
        for (let x = this.posx + 1, y = this.posy - 1; x < 8 && y >= 0; x++, y--)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
        for (let x = this.posx - 1, y = this.posy + 1; x >= 0 && y < 8; x--, y++)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
        for (let x = this.posx - 1, y = this.posy - 1; x >= 0 && y >= 0; x--, y--)
        {
            if (checkCell(x, y, this) == false)
                break;
        }
    }
    resetPossibleMove()
    {
        for (var i = 0; i < 8; i++)
        {
            for (var j = 0; j < 8; j++)
                this.possibleMoves[i][j] = "noPossibleMove";
        }
    }
}

//CHECK CELL
function checkCell(x, y, piece)
{
    let color = "white";
    if (piece.color == "black")
        color = "black";
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
    {   
        if (pieces[x][y] == "")
            piece.possibleMoves[x][y] = "PossibleMove";
        else
        {
            if (pieces[x][y].color != piece.color)
            {
                if (pieces[x][y].name == "King")
                {
                    registerCheckMoves(piece, x, y);
                    pieces[x][y].checked = 1;
                }
            }    
            if (pieces[x][y].color == piece.color)
            {
                piece.possibleMoves[x][y] = "PossibleDefense";
                return false;
            }
            else
            {
                piece.possibleMoves[x][y] = "PossibleMove";
                return false;
            }
        }
        return true;
    }
    return false;
}

function registerCheckMoves(piece, x, y)
{
    let posx = piece.posx;
    let posy = piece.posy;
    let king = piece.color === "black" ? whiteKing : blackKing;
    if (isKnightMove(piece, x, y) == true)
    {
        king.check[x][y] = "CheckMove";
        king.check[posx][posy] = "Checker";
    }
    else if (isRowMove(piece, x, y, king))
        king.check[posx][posy] = "Checker";
    else if (isColMove(piece, x, y, king))
        king.check[posx][posy] = "Checker";
    else if (isDiagMove(piece, x, y, king))
        king.check[posx][posy] = "Checker";
}

function isRowMove(piece, x, y, king)
{
    let posx = piece.posx;
    let posy = piece.posy;
    
    if (y == posy && x < posx || y == posy && x > posx)
    {
        if (x < posx)
        {   
            for (let indx = posx; indx >= x; indx--)
                king.check[indx][posy] = "CheckMove";
        }
        else if (x > posx)
        {
            for (let indx = posx; indx < x; indx++)
                king.check[indx][posy] = "CheckMove";
        }
        king.check[posx][posy] = "Checker";
        return true;
    }
    return false;
}

function isColMove(piece, x, y, king)
{
    let posx = piece.posx;
    let posy = piece.posy;
    
    if (x == posx && y < posy || x == posx && y > posy)
    {
        if (y < posy)
        {   
            for (let indy = posy; indy >= y; indy--)
                king.check[posx][indy] = "CheckMove";
        }
        else if (y > posy)
        {   
            for (let indy = posy; indy < y; indy++)
                king.check[posx][indy] = "CheckMove";
        }
        king.check[posx][posy] = "Checker";
        return true;
    }
    return false;
}

function isDiagMove(piece, x, y, king)
{
    let posx = piece.posx;
    let posy = piece.posy;
    
    console.log(x, y, posx, posy, "x - posx :", x - posx, "y - posy :", y - posy);
    if (Math.abs(x - posx) == Math.abs(y - posy))
    {
        console.log("DIAG MOVE ?");
        if (x < posx && y < posy)
        {   
            console.log("oui");
            for (let indx = posx, indy = posy; x < indx, y < indy; indx--, indy--)
                king.check[indx][indy] = "CheckMove";
        }
        if (x > posx && y > posy)
        {   
            for (let indx = posx, indy = posy; x > indx, y > indy; indx++, indy++)
                king.check[indx][indy] = "CheckMove";
        }
        if (x < posx && y > posy)
        {
            for (let indx = posx, indy = posy; x < indx && y > indy; indx--, indy++)
                king.check[indy][indx] = "CheckMove";
        }
        if (x > posx && y < posy)
        {
            for (let indx = posx, indy = posy; x > indx, y < indy; indx++, indy--)
                king.check[indy][indx] = "CheckMove";
        }
        return true;
    }
    return false;
}

function isKnightMove(piece, x, y)
{
    let posx = piece.posx;
    let posy = piece.posy;
    
    if ((x == posx + 2 && y == posy + 1) || (x == posx + 2 && y == posy - 1) || (x == posx - 2 && y == posy + 1) || (x == posx - 2 && y == posy - 1) || (x == posx + 1 && y == posy + 2) || (x == posx + 1 && y == posy - 2) || (x == posx - 1 && y == posy + 2) || (x == posx - 1 && y == posy - 2))
        return true;
    return false;
}

//PAWN UTILS
function pawnAttackCell(x, y, piece)
{
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
    {       
        pawnCheckAttack(x, y, piece);
    }
}

function pawnCheckAttack(x, y, piece)
{
    if (pieces[x][y] == "")
        return false;
    if (isPossible(x, y, piece) && pieces[x][y].color != piece.color)
    {   
        if (pieces[x][y].name == "King")
            pieces[x][y].checked = 1;
        piece.possibleMoves[x][y] = "PossibleMove";
        return true;
    }
    else if (pieces[x][y].color == piece.color)
    {
        if (pieces[x][y].name == "King")
            pieces[x][y].checked = 1;
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
    console.log(x, y);
    console.log(pieces);
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
        if (pieces[x][y].color != piece.color && !isEnemyMove(x, y, piece))
            return true;
        else if (isEnemyMove(x, y, piece))
            console.log("IT IS", x, y, piece);
    return false;
}

function isPossible(x, y, piece)
{
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
        if (pieces[x][y].color != piece.color)
            return true;
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
    let team;
    team = blackTeam;
    if (piece.color == "black")
        team = whiteTeam;
    for (let i = 0; i < 8; i++)
    {
        team[i].resetPossibleMove();
        if (team[i].name == "King")
            team[i].getPossibleNormalMove();
        else if (team[i].name == "Pawn")
        {
            team[i].getAttackMove();
            console.log(team[i]);
        }
        else
            team[i].getPossibleMove();
        if (team[i].possibleMoves[x][y] == "PossibleMove")
        {
            console.log("HEY THIS IS", team[i]);
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
    // for (let i = 0; i < 8; i++)
    //     pieces[1][i] = new Pawn("Pawn", "black", 1, i, "blackpawn.svg", 1);
    pieces[0][0] = new Rook("Rook", "black", 0, 0, "blackrook.svg");
    pieces[0][1] = new Knight("Knight", "black", 0, 1, "blackknight.svg");
    pieces[0][2] = new Bishop("Bishop", "black", 0, 2, "blackbishop.svg");
    pieces[0][3] = new Queen("Queen", "black", 0, 3, "blackqueen.svg");
    blackKing = pieces[0][4] = new King("King", "black", 0, 4, "blackking.svg");
    pieces[0][5] = new Bishop("Bishop", "black", 0, 5, "blackbishop.svg");
    pieces[0][6] = new Knight("Knight", "black", 0, 6, "blackknight.svg");
    pieces[0][7] = new Rook("Rook", "black", 0, 7, "blackrook.svg", 2);
    // for (let i = 0; i < 8; i++)
    //     pieces[6][i] = new Pawn("Pawn", "white", 6, i, "whitepawn.svg");
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
    // for (let runner = 0; runner < 2; runner++)
    // {
        for (let i = 0; i < 8; i++)
        {
            blackTeam[i] = pieces[0][i];   
        }
    // }
    // for (let runner = 6; runner < 8; runner++)
    // {
        for (let i = 0; i < 8; i++)
        {
            whiteTeam[i] = pieces[7][i];   
        }
    // }
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
    console.log(piece);
    if (piece == "")
        return ;
    piece.resetPossibleMove();
    piece.getPossibleMove();
    let color = piece.color;
    let colorEnemy;
    if (color == "black")
        colorEnemy = "white";
    else
        colorEnemy = "black";
    console.log(color, colorEnemy);
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock" || piece.possibleMoves[i][j] == "PossibleDoubleMove") && pieces[i][j].color == colorEnemy)
                drawPossibleCaptureMove(i, j, ctx);
            else if (piece.possibleMoves[i][j] == "enPassant" && pieces[i][j].color == null)
                drawPossibleCaptureMove(i, j, ctx);
            else if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock" || piece.possibleMoves[i][j] == "PossibleDoubleMove") && pieces[i][j].color == null)
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


// MAIN GAME FUNCTION
function game(x, y, context)
{
    var width = canvas.offsetWidth;
    var size = width / 8;
    var posx = Math.floor((x / size));
    var posy = Math.floor((y / size));
    var NULL = null;
    
    console.log(whiteKing);
    console.log(blackKing);    
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
            drawPossibleMove(selectedOne, context);
        }
    }
    else
    {
        if (isChecked() == true)
        {
            console.log("I AM CHECKED");
            console.log(isCheckMate(), ": ischeckmate");
            if (isCheckMate())
            {
                console.log("I AM CHECKEDMATED");
                alert("YOU GOT CHECKMATED");
            }
            if (selected)
            {
                selected = false;
                selectedOne = null;
                drawChess(context);
            }
            return ;
        }
        redrawPossibleCapture(context);
        if (!selectedOne.color)
        {
            selected = false;
            selectedOne = null;
            return ;
        }
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
        else
        {
            selected = false;
            selectedOne = null;
        }
        handleEnPassant(context);
		drawChess(context);
    }
}

function isCheckMate()
{
    let team = oldColor === "white" ? blackTeam : whiteTeam;
    let king = oldColor === "white" ? blackKing : whiteKing;
    for (let i = 0; i < 8; i++)
    {
        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                if (team[i].possibleMoves[x][y] == "PossibleMove" && (king.check[x][y] == "CheckMove" || king.check[x][y] == "Checker"))
                    return false;
            }
        }
    }
    return true;
}

function defendCheck()
{
    
}

function isChecked()
{
    let color = "white";
    if (oldColor == "white")
        color = "black";
    let team = whiteTeam;
    if (color == "black")
        team = blackTeam;
    for (let i = 0; i < 16; i++)
    {
        if (team[i].name == "King")
        {
            if (team[i].checked == 1)
                return true;
            return false;
        }
    }
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


//REDRAW MOVES OR REPLACE CELLS
function replaceCell(x, y, piece)
{
    let count1 = x;
    let count2 = y;
    let count = y + x + 1;
    ctx.fillStyle = "burlywood";
    if (count % 2 == 1)
        ctx.fillStyle = "antiquewhite";
    ctx.fillRect(y * 100, x * 100, 100, 100);
    if (piece)
        draw(y * 100, x * 100, "../static/srcs/chess/" + piece.img);
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
            if (selectedOne.possibleMoves[i][j] == "PossibleMove" && pieces[i][j].color == colorEnemy)
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
    ctx.font = '12px Arial';
    for(let i= 0;i < 800; i+=100) 
    {
        count++;
        for (let j = 0; j < 800; j+=100)
        {
            var pos = i + j + 150;
            var count1 = i / 100;
            var count2 = j / 100;
            if (pieces[count2][count1].color != null)
                draw(i, j, "../static/srcs/chess/" + pieces[count2][count1].img);
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
    const arrV = ['1', '2', '3', '4', '5', '6', '7', '8'];
	const arrC = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    var count = 0;
    ctx.font = '408px Arial';
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

const canvas = document.getElementById("chess");
const ctx = canvas.getContext("2d");
enPassant[0] = "";
enPassant[1] = "";
drawCheckers(ctx);
var pieces = new Array(8);
initChessBoard();
var whiteTeam = new Array(16);
var blackTeam = new Array(16);
initTeams();

drawChess(ctx);
canvas.addEventListener('click', function() {game(event.layerX, event.layerY, ctx)}, false);
