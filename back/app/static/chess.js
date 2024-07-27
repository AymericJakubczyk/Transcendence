var selected = 0;
var selectedOne = null;
var oldx;
var oldy;
var oldColor = "black";
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
        console.log(this.enPassant);
        if (this.color == "white")
        {
            if (posx == 6)
            {   
                if (isPossible(posx - 1, posy, this) && pieces[posx - 1][posy].color != "black")
                {   
                    this.possibleMoves[posx - 1][posy] = "PossibleMove";
                    if (isPossible(posx - 2, posy, this) && pieces[posx - 2][posy].color != "black")
                    {
                        console.log("DOUBLE MOVE OF PAWN");
                        this.possibleMoves[posx - 2][posy] = "PossibleMove";
                        if (posx - 2 >= 0 && posy - 1 >= 0 && isEnemyPawn(posx - 2, posy - 1, pieces[posx - 2][posy - 1]))
                        {   
                            console.log(pieces[posx - 2][posy - 1]);
                            pieces[posx - 2][posy - 1].enPassant = 1;
                            pieces[posx - 2][posy - 1].ePright = 1;
                        }
                        if (posx - 2 >= 0 && posy + 1 < 8 && isEnemyPawn(posx - 2, posy + 1, pieces[posx - 2][posy + 1]))
                        {   
                            console.log(pieces[posx - 2][posy + 1]);
                            pieces[posx - 2][posy + 1].enPassant = 1;
                            pieces[posx - 2][posy + 1].ePleft = 1;
                        }
                    }
                }
            }
            if (this.enPassant == 1)
            {
                if (this.ePright == 1)
                {
                    if (isPossible(posx - 1, posy, this) && pieces[posx - 1][posy].color != "black")
                        this.possibleMoves[posx - 1][posy + 1] = "enPassant";
                }
                if (this.ePleft == 1)
                {
                    if (isPossible(posx - 1, posy, this) && pieces[posx - 1][posy].color != "black")
                        this.possibleMoves[posx - 1][posy - 1] = "enPassant";
                }
            }
            if (isPossible(posx - 1, posy, this) && pieces[posx - 1][posy].color != "black")
                    this.possibleMoves[posx - 1][posy] = "PossibleMove";
            if ((posx - 1 >= 0 && posy - 1 >= 0) && pieces[posx - 1][posy - 1].color == "black")
                this.possibleMoves[posx - 1][posy - 1] = "PossibleMove";
            if ((posx - 1 >= 0 && posy + 1 < 8) && pieces[posx - 1][posy + 1].color == "black")
                this.possibleMoves[posx - 1][posy + 1] = "PossibleMove";
        }
        else
        {
            if (posx == 1)
            {   
                if (isPossible(posx + 1, posy, this) && pieces[posx + 1][posy].color != "white")
                {   
                    this.possibleMoves[posx + 1][posy] = "PossibleMove";
                    if (isPossible(posx + 2, posy, this) && pieces[posx + 2][posy].color != "white")
                    {
                        console.log("DOUBLE MOVE OF PAWN");
                        this.possibleMoves[posx + 2][posy] = "PossibleMove";
                        console.log(pieces[posx + 2][posy]);
                        if (posx + 2 < 8 && posy - 1 >= 0 && isEnemyPawn(posx + 2, posy - 1, pieces[posx + 2][posy - 1]))
                        {   
                            console.log(pieces[posx + 2][posy - 1]);
                            pieces[posx + 2][posy - 1].enPassant = 1;
                            pieces[posx + 2][posy - 1].ePright = 1;
                        }
                        if (posx + 2 < 8 && posy + 1 < 8 && isEnemyPawn(posx + 2, posy + 1, pieces[posx + 2][posy + 1]))
                        {   
                            console.log(pieces[posx + 2][posy + 1]);
                            pieces[posx + 2][posy + 1].enPassant = 1;
                            pieces[posx + 2][posy + 1].ePleft = 1;
                        }
                    }
                }
            }
            if (this.enPassant == 1)
            {
                if (this.ePright == 1)
                {
                    if (isPossible(posx + 1, posy + 1, this) && pieces[posx + 1][posy + 1].color != "black")
                        this.possibleMoves[posx + 1][posy + 1] = "enPassant";
                }
                if (this.ePleft == 1)
                {
                    if (isPossible(posx + 1, posy - 1, this) && pieces[posx + 1][posy - 1].color != "black")
                        this.possibleMoves[posx + 1][posy - 1] = "enPassant";
                }
            }
            if (isPossible(posx + 1, posy, this) && pieces[posx + 1][posy].color != "white")
                    this.possibleMoves[posx + 1][posy] = "PossibleMove";
            if ((posx + 1 < 8 && posy - 1 >= 0) && pieces[posx + 1][posy - 1].color == "white")
                this.possibleMoves[posx + 1][posy - 1] = "PossibleMove";
            if ((posx + 1 < 8 && posy + 1 < 8) && pieces[posx + 1][posy + 1].color == "white")
                this.possibleMoves[posx + 1][posy + 1] = "PossibleMove";
        }
        console.log(this.possibleMoves);
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
        if (posx + 2 < 8)
        {   
            if (posy + 1 < 8)
                if (pieces[posx + 2][posy + 1].color != this.color)
                    this.possibleMoves[posx + 2][posy + 1] = "PossibleMove";
            if (posy - 1 >= 0)
                if (pieces[posx + 2][posy - 1].color != this.color)
                    this.possibleMoves[posx + 2][posy - 1] = "PossibleMove";
        }
        if (posx - 2 >= 0)
        {   
            if (posy + 1 < 8)
                if (pieces[posx - 2][posy + 1].color != this.color)
                    this.possibleMoves[posx - 2][posy + 1] = "PossibleMove";
            if (posy - 1 >= 0)
                if (pieces[posx - 2][posy - 1].color != this.color)
                    this.possibleMoves[posx - 2][posy - 1] = "PossibleMove";
        }
        if (posy + 2 < 8)
        {   
            if (posx + 1 < 8)
                if (pieces[posx + 1][posy + 2].color != this.color)
                    this.possibleMoves[posx + 1][posy + 2] = "PossibleMove";
            if (posx - 1 >= 0)
                if (pieces[posx - 1][posy + 2].color != this.color)
                    this.possibleMoves[posx - 1][posy + 2] = "PossibleMove";
        }
        if (posy - 2 >= 0)
        {        
            if (posx + 1 < 8)
                if (pieces[posx + 1][posy - 2].color != this.color)
                    this.possibleMoves[posx + 1][posy - 2] = "PossibleMove";
            if (posx - 1 >= 0)
                if (pieces[posx - 1][posy - 2].color != this.color)
                    this.possibleMoves[posx - 1][posy - 2] = "PossibleMove";
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
            if (i == 8)
                break;
            if (!pieces[i][posy].color)
                this.possibleMoves[i][posy] = "PossibleMove";
            else
            {
                if (pieces[i][posy].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[i][posy] = "PossibleMove";
                    break;
                }
            }
        }
        for (let i = posx - 1; i < 8; i--)
        {
            if (i < 0)
                break;
            if (!pieces[i][posy].color)
                this.possibleMoves[i][posy] = "PossibleMove";
            else
            {
                if (pieces[i][posy].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[i][posy] = "PossibleMove";
                    break;
                }
            }
        }
        for (let i = posy + 1; i < 8; i++)
        {
            if (i == 8)
                break;
            if (!pieces[posx][i].color)
                this.possibleMoves[posx][i] = "PossibleMove";
            else
            {
                if (pieces[posx][i].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[posx][i] = "PossibleMove";
                    break;
                }
            }
        }
        for (let i = posy - 1; i < 8; i--)
        {
            if (i < 0)
                break;
            if (!pieces[posx][i].color)
                this.possibleMoves[posx][i] = "PossibleMove";
            else
            {
                if (pieces[posx][i].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[posx][i] = "PossibleMove";
                    break;
                }
            }
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
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx + 1, y = this.posy - 1; x < 8 && y >= 0; x++, y--)
        {
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx - 1, y = this.posy + 1; x >= 0 && y < 8; x--, y++)
        {
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx - 1, y = this.posy - 1; x >= 0 && y >= 0; x--, y--)
        {
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
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
        let posx = this.posx;
        let posy = this.posy;
        for (let i = posx + 1; i < 8; i++)
        {
            if (posx + 1 > 7)
                break ;
            if (!pieces[i][posy].color)
                this.possibleMoves[i][posy] = "PossibleMove";
            else
            {
                if (pieces[i][posy].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[i][posy] = "PossibleMove";
                    break;
                }
            }
        }
        for (let i = posx - 1; i < 8; i--)
        {
            if (posx - 1 < 0)
                break ;
            if (!pieces[i][posy].color)
                this.possibleMoves[i][posy] = "PossibleMove";
            else
            {
                if (pieces[i][posy].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[i][posy] = "PossibleMove";
                    break;
                }
            }
        }
        for (let i = posy + 1; i < 8; i++)
        {
            if (posy + 1 > 7)
                break ;
            if (!pieces[posx][i].color)
                this.possibleMoves[posx][i] = "PossibleMove";
            else
            {
                if (pieces[posx][i].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[posx][i] = "PossibleMove";
                    break;
                }
            }
        }
        for (let i = posy - 1; i < 8; i--)
        {
            if (posx - 1 < 7)
                break ;
            if (!pieces[posx][i].color)
                this.possibleMoves[posx][i] = "PossibleMove";
            else
            {
                if (pieces[posx][i].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[posx][i] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx + 1, y = this.posy + 1; x < 8 && y < 8; x++, y++)
        {
            if (posx + 1 > 7 || posy + 1 > 7)
                break ;
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx + 1, y = this.posy - 1; x < 8 && y >= 0; x++, y--)
        {
            if (posx + 1 > 7 || posy - 1 < 0)
                break ;
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx - 1, y = this.posy + 1; x > 0 && y < 8; x--, y++)
        {
            if (posx - 1 < 0 || posy + 1 > 7)
                break ;
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
        }
        for (let x = this.posx - 1, y = this.posy - 1; x < 8 && y < 8 && x >= 0 && y >= 0; x--, y--)
        {
            if (posx - 1 < 0 || posy - 1 < 0)
                break ;
            if (!pieces[x][y].color)
                this.possibleMoves[x][y] = "PossibleMove";
            else
            {
                if (pieces[x][y].color == this.color)
                    break;
                else
                {
                    this.possibleMoves[x][y] = "PossibleMove";
                    break;
                }
            }
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

function doRightRock(x)
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

function doLeftRock(x)
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

function isPossibleKingMove(x, y, piece)
{
    console.log(x, y);
    console.log(pieces);
    if (x >= 0 && x < 8 && y >= 0 && y < 8)
        if (pieces[x][y].color != piece.color && !isEnemyMove(x, y, piece))
            return true;
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
    console.log(piece); 
    let colour = "white";
    if (piece.color == "white")
        colour = "black";
    // console.log(pieces[x][y].name, pieces[x][y].color, colour);
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
    console.log(team, piece.color);
    for (let i = 0; i < 16; i++)
    {
        console.log(team[i]);
        if (team[i].name != "King")
        {
            team[i].getPossibleMove();
            if (team[i].possibleMoves[x][y] == "PossibleMove")
            {
                console.log("I CAN GO THERE SO YOU CANNOT MOVE", team[i]);
                return true;
            }
        }
    }
    return false;
}

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
    pieces[0][0] = new Rook("Rook", "black", 0, 0, "blackrook.svg");
    pieces[0][1] = new Knight("Knight", "black", 0, 1, "blackknight.svg");
    pieces[0][2] = new Bishop("Bishop", "black", 0, 2, "blackbishop.svg");
    pieces[0][3] = new Queen("Queen", "black", 0, 3, "blackqueen.svg");
    pieces[0][4] = new King("King", "black", 0, 4, "blackking.svg");
    pieces[0][5] = new Bishop("Bishop", "black", 0, 5, "blackbishop.svg");
    pieces[0][6] = new Knight("Knight", "black", 0, 6, "blackknight.svg");
    pieces[0][7] = new Rook("Rook", "black", 0, 7, "blackrook.svg", 2);
    for (let i = 0; i < 8; i++)
        pieces[6][i] = new Pawn("Pawn", "white", 6, i, "whitepawn.svg");
    pieces[7][0] = new Rook("Rook", "white", 7, 0, "whiterook.svg", 1);
    pieces[7][1] = new Knight("Knight", "white", 7, 1, "whiteknight.svg");
    pieces[7][2] = new Bishop("Bishop", "white", 7, 2, "whitebishop.svg");
    pieces[7][3] = new Queen("Queen", "white", 7, 3, "whitequeen.svg");
    pieces[7][4] = new King("King", "white", 7, 4, "whiteking.svg");
    pieces[7][5] = new Bishop("Bishop", "white", 7, 5, "whitebishop.svg");
    pieces[7][6] = new Knight("Knight", "white", 7, 6, "whiteknight.svg");
    pieces[7][7] = new Rook("Rook", "white", 7, 7, "whiterook.svg", 2);
}

function initTeams()
{
    for (let runner = 0; runner < 2; runner++)
    {
        for (let i = 0; i < 8; i++)
        {
            blackTeam[runner * 8 + i] = pieces[runner][i];   
        }
    }
    for (let runner = 6; runner < 8; runner++)
    {
        for (let i = 0; i < 8; i++)
        {
            whiteTeam[(runner - 6) * 8 + i] = pieces[runner][i];   
        }
    }
}

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
            if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock") && pieces[i][j].color == colorEnemy)
                drawPossibleCaptureMove(i, j, ctx);
            else if (piece.possibleMoves[i][j] == "enPassant" && pieces[i][j].color == null)
                drawPossibleCaptureMove(i, j, ctx);
            else if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock") && pieces[i][j].color == null)
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

function moovePawn(x, y, context)
{
    var width = canvas.offsetWidth;
    var size = width / 8;
    var posx = Math.floor((x / size));
    var posy = Math.floor((y / size));
    var NULL = null;
/* The code is attempting to log the value of the variable `pieces` to the console. However, the code
snippet provided is incomplete and lacks the definition or assignment of the `pieces` variable. To
provide a more accurate answer, the code snippet needs to include the definition or assignment of
the `pieces` variable. */
    console.log(pieces, selected);
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
        redrawPossibleCapture(context);
        if (!selectedOne.color)
        {
            selected = false;
            selectedOne = null;
            return ;
        }
        if (selectedOne.possibleMoves[posy][posx] == "PossibleMove")
        {
            replaceCell(posy, posx, selectedOne);
            pieces[posy][posx] = selectedOne;
            selectedOne.posx = posy;
            selectedOne.posy = posx;
            oldColor = selectedOne.color;
            whosPlaying(oldColor);
            pieces[oldy][oldx] = 'noPossibleMove';
            if (selectedOne.name == "King" || selectedOne.name == "Rook")
                selectedOne.count = 1;    
            selected = false;
            selectedOne = null;
            drawChess(context);
        }
        else if (selectedOne.possibleMoves[posy][posx] == "RightRock")
        {
            selectedOne.move = 1;
            doRightRock(posy);
            oldColor = selectedOne.color;
            selected = false;
            selectedOne = null;
            drawChess(context);
        }
        else if (selectedOne.possibleMoves[posy][posx] == "LeftRock")
        {
            selectedOne.move = 1;
            oldColor = selectedOne.color;
            doLeftRock(posy);
            selected = false;
            selectedOne = null;
            drawChess(context);
        }
        else if (selectedOne.possibleMoves[posy][posx] == "enPassant")
        {
            replaceCell(posy, posx, selectedOne);
            console.log(posy, posx);
            if (selectedOne.color == "white")
                pieces[posy + 1][posx] = 'noPossibleMove';
            else
                pieces[posy - 1][posx] = 'noPossibleMove';
            pieces[posy][posx] = selectedOne;
            selectedOne.posx = posy;
            selectedOne.posy = posx;
            oldColor = selectedOne.color;
            whosPlaying(oldColor);
            pieces[oldy][oldx] = 'noPossibleMove';  
            selected = false;
            selectedOne = null;
            drawChess(context);
        }
        else
        {
            selected = false;
            selectedOne = null;
            drawChess(context);
        }
    }
    console.log(selected);
}

function replaceCell(x, y, piece)
{    
    let count1 = x;
    let count2 = y;
    let count = y + x + 1;
    // ctx.fillStyle = "black";
    ctx.fillStyle = "burlywood";
    console.log(x, y, count);
    if (count % 2 == 1)
        ctx.fillStyle = "antiquewhite";
    console.log(x, y);
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
    console.log(color, colorEnemy);
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
    console.log(centerX, centerY);
    const radius = 45;
    context.beginPath();
    context.arc(centerY, centerX, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 6;
    ctx.stroke();
    context.closePath();
}

function drawChess(ctx)
{
    var count = 0;
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
            count++;
        }
    }
    // canvas.addEventListener('click', function() {console.log(event.clientX), console.log(event.clientY)}, false);
}

function drawCheckers(ctx)
{
    var count = 0;
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
            count++;
        }
    }
}

    
const canvas = document.getElementById("chess");
const ctx = canvas.getContext("2d");
drawCheckers(ctx);
var pieces = new Array(8);
initChessBoard();
var whiteTeam = new Array(16);
var blackTeam = new Array(16);
initTeams();


drawChess(ctx);
canvas.addEventListener('click', function() {moovePawn(event.layerX, event.layerY, ctx)}, false);

