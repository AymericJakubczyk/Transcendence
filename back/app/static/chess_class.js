var canCheck = 0;

class Pawn {
    constructor (name, color, posx, posy, img)
    {
        this.defended = 0;
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
        this.defended = 0;
        let posx = this.posx;
        let posy = this.posy;
        if (this.color == "white")
        {
            this.getAttackMove();
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
            if (posx == 1)
                pawnCheckProm(posx - 1, posy, this);
            else
                pawnCheckCell(posx - 1, posy, this);
        }
        else
        {
            this.getAttackMove();
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
            if (posx == 6)
                pawnCheckProm(posx + 1, posy, this);
            else
                pawnCheckCell(posx + 1, posy, this);
        }
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
        this.defended = 0;
        let posx = this.posx;
        let posy = this.posy;
        if (canCheck == 1) {canCheck = 0;}
        checkCell(posx + 2, posy + 1, this);
        checkCell(posx + 2, posy - 1, this);

        checkCell(posx - 2, posy + 1, this);
        checkCell(posx - 2, posy - 1, this);

        checkCell(posx + 1, posy + 2, this);
        checkCell(posx - 1, posy + 2, this);
 
        checkCell(posx + 1, posy - 2, this);
        checkCell(posx - 1, posy - 2, this);
        if (canCheck == 1) {registerMoves(this)}
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
        this.defended = 0;
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
        this.defended = 0;
        let posx = this.posx;
        let posy = this.posy;
        if (canCheck == 1) {canCheck = 0;}
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
        if (canCheck == 1) {registerMoves(this)}
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
        this.defended = 0;
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
        this.defended = 0;
        let posx = this.posx;
        let posy = this.posy;
        if (canCheck == 1) {canCheck = 0;}
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
        if (canCheck == 1) {registerMoves(this)}
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
    resetCheck()
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
        this.defended = 0;
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
        if (canCheck == 1) {canCheck = 0;}
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
        if (canCheck == 1) {registerMoves(this)}
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
    let count = 0;
    let tmpx, tmpy;
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
                    canCheck = 1;
                    count += 1;
                    tmpx = x;
                    tmpy = y;
                    pieces[x][y].checked = 1;
                }
            }    
            if (pieces[x][y].color == piece.color)
            {
                pieces[x][y].defended = 1;
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

function checkCheckerCell(x, y, piece)
{
    let color = "white";
    if (piece.color == "black")
        color = "black";
    let count = 0;
    let tmpx, tmpy;
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
                    count += 1;
                    tmpx = x;
                    tmpy = y;
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
    console.log(piece, king.posx, king.posy);
    console.log(piece);
    isKnightMove(piece, x, y);
    if (y == posy && x < posx || y == posy && x > posx)
        isRowMove(piece, x, y, king);
    if (x == posx && y < posy || x == posx && y > posy)
        isColMove(piece, x, y, king);
    if (Math.abs(x - posx) == Math.abs(y - posy))
        isDiagMove(piece, x, y, king);
    // king.check[posx][posy] = "Checker";
    console.log(king);
}

function registerMoves(piece)
{
    console.log("registerMoves");
    let king = piece.color === "black" ? whiteKing : blackKing;
    let posxking = king.posx;
    let posyking = king.posy;
    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            if (i == piece.posx && j == piece.posy)
                king.check[i][j] = "Checker";
            if (piece.possibleMoves[i][j] == "PossibleMove")
                king.check[i][j] = "CheckMove";
        }
    }
    registerCheckMoves(piece, posxking, posyking);
}

function isRowMove(piece, x, y, king)
{
    console.log("rowMove");
    let posx = piece.posx;
    let posy = piece.posy;

    if (y == posy && x < posx || y == posy && x > posx)
    {
        if (x < posx)
        {   
            for (let indx = posx; indx >= 0; indx--)
                king.check[indx][posy] = "CheckMove";
        }
        else if (x > posx)
        {
            for (let indx = posx; indx < 8; indx++)
                king.check[indx][posy] = "CheckMove";
        }
        king.check[posx][posy] = "Checker";
    }
}

function isColMove(piece, x, y, king)
{
    let posx = piece.posx;
    let posy = piece.posy;
    console.log("colMove");
    
    console.log("MAIS QUE PASA", piece, king);
    if (x == posx && y < posy || x == posx && y > posy)
    {
        if (y < posy)
        {   
            for (let indy = posy; indy >= 0; indy--)
                king.check[posx][indy] = "CheckMove";
        }
        else if (y > posy)
        {   
            for (let indy = posy; indy < 8; indy++)
                king.check[posx][indy] = "CheckMove";
        }
        king.check[posx][posy] = "Checker";
    }
}

function isDiagMove(piece, x, y, king)
{
    let posx = piece.posx;
    let posy = piece.posy;
    console.log("DiagMove");
    
    if (Math.abs(x - posx) == Math.abs(y - posy))
    {
        if (x < posx && y < posy)
        {   
            for (let indx = posx, indy = posy; 0 < indx && 0 < indy; indx--, indy--)
                king.check[indx][indy] = "CheckMove";
        }
        if (x > posx && y > posy)
        {   
            for (let indx = posx, indy = posy; 8 > indx && 8 > indy; indx++, indy++)
            {
                king.check[indx][indy] = "CheckMove";
            }
        }
        if (x < posx && y > posy)
        {
            for (let indx = posx, indy = posy; 0 < indx && 8 > indy; indx--, indy++)
                king.check[indx][indy] = "CheckMove";
        }
        if (x > posx && y < posy)
        {
            for (let indx = posx, indy = posy; 8 > indx && 0 < indy; indx++, indy--)
                king.check[indx][indy] = "CheckMove";
        }
    }
}

function isKnightMove(piece, x, y)
{
    let posx = piece.posx;
    let posy = piece.posy;
    
    if ((x == posx + 2 && y == posy + 1) || (x == posx + 2 && y == posy - 1) || (x == posx - 2 && y == posy + 1) || (x == posx - 2 && y == posy - 1) || (x == posx + 1 && y == posy + 2) || (x == posx + 1 && y == posy - 2) || (x == posx - 1 && y == posy + 2) || (x == posx - 1 && y == posy - 2))
        return true;
    return false;
}