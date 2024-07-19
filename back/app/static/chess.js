var selected = 0;
var selectedOne = null;

class Pawn {
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
        console.log(posx, posy);
        if (posx == 6)
            console.log("MAISGROS");
        if (this.color == "white")
        {
            if (posx == 6)
                this.possibleMoves[posx - 2][posy] = "PossibleMove";
            this.possibleMoves[posx - 1][posy] = "PossibleMove";
        }
        else
        {
            if (posx == 1)
                this.possibleMoves[posx + 2][posy] = "PossibleMove";
            this.possibleMoves[posx + 1][posy] = "PossibleMove";
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
        if (posx + 2 < 8)
        {   
            if (posy + 1 < 8)
                this.possibleMoves[posx + 2][posy + 1] = "PossibleMove";
            if (posy - 1 >= 0)
                this.possibleMoves[posx + 2][posy - 1] = "PossibleMove";
        }
        if (posx - 2 >= 0)
        {   
            if (posy + 1 < 8)
                this.possibleMoves[posx - 2][posy + 1] = "PossibleMove";
            if (posy - 1 >= 0)
                this.possibleMoves[posx - 2][posy - 1] = "PossibleMove";
        }
        if (posy + 2 < 8)
        {   
            if (posx + 1 < 8)
                this.possibleMoves[posx + 1][posy - 2] = "PossibleMove";
            if (posx - 1 >= 0)
                this.possibleMoves[posx - 1][posy - 2] = "PossibleMove";
        }
        if (posy - 2 >= 0)
        {        
            if (posx + 1 < 8)
                this.possibleMoves[posx + 1][posy - 2] = "PossibleMove";
            if (posx - 1 >= 0)
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
        console.log(posx, posy);
        for (let i = 0; i < 8; i++)
            if (i != posx)
                this.possibleMoves[i][posy] = "PossibleMove";
        for (let i = 0; i < 8; i++)
            if (i != posy)
                this.possibleMoves[posx][i] = "PossibleMove";
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
            this.possibleMoves[x][y] = "PossibleMove";
        }
        for (let x = this.posx + 1, y = this.posy - 1; x < 8 && y >= 0; x++, y--)
        {
            this.possibleMoves[x][y] = "PossibleMove";
        }
        for (let x = this.posx - 1, y = this.posy + 1; x >= 0 && y < 8; x--, y++)
        {
            this.possibleMoves[x][y] = "PossibleMove";
        }
        for (let x = this.posx - 1, y = this.posy - 1; x >= 0 && y >= 0; x--, y--)
        {
            this.possibleMoves[x][y] = "PossibleMove";
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
        if (posy - 1 >= 0)
            for (let i = posx - 1; i < posx + 2; i++)
                if (posx >= 0 && posx < 8)
                    this.possibleMoves[i][posy - 1] = "PossibleMove";
        if (posy + 1 < 8)
            for (let i = posx - 1; i < posx + 2; i++)
                if (posx >= 0 && posx < 8)
                    this.possibleMoves[i][posy + 1] = "PossibleMove";
        if (posx - 1 >= 0)
            for (let i = posy - 1; i < posy + 2; i++)
                if (posy >= 0 && posy < 8)
                    this.possibleMoves[posx - 1][i] = "PossibleMove";
        if (posx + 1 < 8)
            for (let i = posy - 1; i < posy + 2; i++)
                if (posy >= 0 && posy < 8)
                    this.possibleMoves[posx + 1][i] = "PossibleMove";
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
        for (let i = 0; i < 8; i++)
            if (i != posx)
                this.possibleMoves[i][posy] = "PossibleMove";
        for (let i = 0; i < 8; i++)
            if (i != posy)
                this.possibleMoves[posx][i] = "PossibleMove";
        for (let x = this.posx + 1, y = this.posy + 1; x < 8 && y < 8; x++, y++)
        {
            this.possibleMoves[x][y] = "PossibleMove";
        }
        for (let x = this.posx + 1, y = this.posy - 1; x < 8 && y >= 0; x++, y--)
        {
            this.possibleMoves[x][y] = "PossibleMove";
        }
        for (let x = this.posx - 1, y = this.posy + 1; x > 0 && y < 8; x--, y++)
        {
            this.possibleMoves[x][y] = "PossibleMove";
        }
        for (let x = this.posx - 1, y = this.posy - 1; x < 8 && y < 8; x--, y--)
        {
            this.possibleMoves[x][y] = "PossibleMove";
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


function initChessBoard()
{
    for (var i = 0; i < 8; i++)
        pieces[i] = new Array(8);
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
            pieces[i][j] = "noPossibleMove";
    }
    for (let i = 0; i < 8; i++)
        pieces[1][i] = new Pawn("Pawn", "black", 1, i, "blackpawn.png");
    pieces[0][0] = new Rook("Rook", "black", 0, 0, "blackrook.png");
    pieces[0][1] = new Knight("Knight", "black", 0, 1, "blackknight.png");
    pieces[0][2] = new Bishop("Bishop", "black", 0, 2, "blackbishop.png");
    pieces[0][3] = new Queen("Queen", "black", 0, 3, "blackqueen.png");
    pieces[0][4] = new King("Queen", "black", 0, 4, "blackking.png");
    pieces[0][5] = new Bishop("Bishop", "black", 0, 5, "blackbishop.png");
    pieces[0][6] = new Knight("Knight", "black", 0, 6, "blackknight.png");
    pieces[0][7] = new Rook("Rook", "black", 0, 7, "blackrook.png");
    for (let i = 0; i < 8; i++)
        pieces[6][i] = new Pawn("Pawn", "white", 6, i, "whitepawn.png");
    pieces[7][0] = new Rook("Rook", "white", 7, 0, "whiterook.png");
    pieces[7][1] = new Knight("Knight", "white", 7, 1, "whiteknight.png");
    pieces[7][2] = new Bishop("Bishop", "white", 7, 2, "whitebishop.png");
    pieces[7][3] = new Queen("Queen", "white", 7, 3, "whitequeen.png");
    pieces[7][4] = new King("Queen", "white", 7, 4, "whiteking.png");
    pieces[7][5] = new Bishop("Bishop", "white", 7, 5, "whitebishop.png");
    pieces[7][6] = new Knight("Knight", "white", 7, 6, "whiteknight.png");
    pieces[7][7] = new Rook("Rook", "white", 7, 7, "whiterook.png");
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
    let color;
    piece.getPossibleMove();
    let colorEnemy;
    if (this.color == "black")
    {   
        color = "white";
        colorEnemy = "black";
    }
    else
    {   
        color = "black";
        colorEnemy = "white";
    }
        for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            if (piece.possibleMoves[i][j] == "PossibleMove" && pieces[i][j].color == color)
                drawPossibleCaptureMove(i, j, ctx);
            else if (piece.possibleMoves[i][j] == "PossibleMove" && pieces[i][j].color == null)
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
    const radius = 50;
    context.beginPath();
    context.arc(centerY, centerX, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'grey';
    ctx.stroke();
    // context.fillStyle = 'grey';
    // context.fill();
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
    console.log(pieces);
    if ((posy <= 8 || 0 >= posy) && (posx <= 8 || 0 >= posx))
    {
        pieces[posy][posx].isSelected = 1;
        selected = 1;
        selectedOne = pieces[posy][posx];
        drawPossibleMove(selectedOne, context);
        
    }
    drawChess(context);
    mooveIt(event.layerX, event.layerY, ctx, posx, posy);
    // canvas.addEventListener('click', function() {}, false);
}

function mooveIt(x, y, ctx, posx, posy)
{
    var width = canvas.offsetWidth;
    var size = width / 8;
    var px = Math.floor((x / size));
    var py = Math.floor((y / size));
    if ((posy <= 8 || 0 >= posy) && (posx <= 8 || 0 >= posx))
    {
        if (pieces[py][px].state == "possibleMoove")
        {
            if (pieces[posy][posx].value == "whitepawn")
            {	
                pieces[py][px].value = "whitepawn";
                pieces[posy][posx].value = "";
            }
            else if (pieces[posy][posx].value == "blackpawn")
            {	
                pieces[py][px].value = "blackpawn";
                pieces[posy][posx].value = "";
            }
        }
    }
    drawChess(ctx);
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
            if (pieces[count2][count1].state == "possibleMoove")
                drawPossibleMove(count2, count1, ctx);
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


drawChess(ctx);
canvas.addEventListener('click', function() {moovePawn(event.layerX, event.layerY, ctx)}, false);

