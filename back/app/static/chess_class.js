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