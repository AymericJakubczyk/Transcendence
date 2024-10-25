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
    piece.getPossibleMove(pieces);
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
            if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock" || piece.possibleMoves[i][j] == "PossibleDoubleMove" || piece.possibleMoves[i][j] == "PossiblePromAtq") && pieces[i][j].color == colorEnemy && willBeCheck(piece, i, j) == false)
                drawPossibleCaptureMove(i, j, ctx);
            else if (piece.possibleMoves[i][j] == "enPassant" && pieces[i][j].color == null && willBeCheck(piece, i, j) == false)
                drawPossibleCaptureMove(i, j, ctx);
            else if ((piece.possibleMoves[i][j] == "PossibleMove" || piece.possibleMoves[i][j] == "RightRock" || piece.possibleMoves[i][j] == "LeftRock" || piece.possibleMoves[i][j] == "PossibleDoubleMove" || piece.possibleMoves[i][j] == "PossibleProm") && pieces[i][j].color == null && willBeCheck(piece, i, j) == false)
                drawTheMove(i, j, ctx);
        }
    }
}

function drawPossibleCaptureMove(x, y, context)
{
    if (color == "black")
    {
        x = 7 - x;
        y = 7 - y;
    }    
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
    if (color == "black")
    {
        x = 7 - x;
        y = 7 - y;
    }    
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
    selectedOne.getPossibleMove(pieces);
    let color = selectedOne.color;
    let colorEnemy;
    if (color == "black")
        colorEnemy = "white";
    else
        colorEnemy = "black";
    getEnemyMoves();
    console.log("HERE");
    for (var i = 0; i < 8; i++)
    {
        for (var j = 0; j < 8; j++)
        {
            if (pieces[i][j] != null)
                console.log(pieces[i][j]);
            if (selectedOne.name == "King" && selectedOne.possibleMoves[i][j] == "PossibleMove" && king.check[i][j] == "noPossibleMove" && pieces[i][j].defended == 0)
                drawTheMove(i, j, context);
            else if (selectedOne.name == "King" && selectedOne.possibleMoves[i][j] == "PossibleMove" && king.check[i][j] == "Checker" && pieces[i][j].defended == 0 && isStillCheck(selectedOne, i, j, king) == false)
                drawPossibleCaptureMove(i, j, context);
            else if ((selectedOne.possibleMoves[i][j] == "PossibleMove" || selectedOne.possibleMoves[i][j] == "PossiblePromAtq") && king.check[i][j] == "Checker" && isStillCheck(selectedOne, i, j, king) == false && selectedOne.name != "King")
                drawPossibleCaptureMove(i, j, context);
            else if (selectedOne.possibleMoves[i][j] == "enPassant" && pieces[i][j].color == null && king.check[i][j] == "Checker" && isStillCheck(selectedOne, i, j, king) == false && selectedOne.name != "King")
                drawPossibleCaptureMove(i, j, context);
            else if ((selectedOne.possibleMoves[i][j] == "PossibleMove" || selectedOne.possibleMoves[i][j] == "PossibleDoubleMove" || selectedOne.possibleMoves[i][j] == "PossibleProm") && king.check[i][j] == "CheckMove" && selectedOne.name != "King"  && isStillCheck(selectedOne, i, j, king) == false)
                drawTheMove(i, j, context);
        }
    }
}

//Promotion drawing
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

function drawFallenPieces()
{
    let teamA = whiteOrder;
    let teamB = blackOrder;
    let space = 50;
    if (color == "black")
    {
        teamA = blackOrder;
        teamB = whiteOrder;
    }
    for (let i = 0; i < teamA.length; i++)
    {
        if (teamA[i].alive == 1)
        {
            drawFallenPiece(teamA[i], space, Fctx);
            space+=50;
        }
    }
    space = 0;
    for (let i = 0; i < teamB.length; i++)
    {
        if (teamB[i].alive == 1)
        {
            drawFallenPiece(teamB[i], space, Wctx);
            space+=50;
        }
    }
}

function drawFallenPiece(piece, space, context)
{
    const img = new Image();
    img.src = "/static/srcs/chess/" + piece.img;
    img.onload = () => {
        context.drawImage(img, 25, space, 50, 50);
    };
}

function drawCheck(king)
{
    let posx = king.posx;
    let posy = king.posy;
    if (color == "black")
    {
        posx = 7 - posx;
        posy = 7 - posy;
    }
    const centerX = posy * 100 + 50;
    const centerY = posx * 100 + 50;
    const radius = 45;
    // Create radial gradient
    const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.2,  // Inner circle
        centerX, centerY, radius         // Outer circle
    );

    // Add color stops
    gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');    // Solid in middle
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');    // Transparent at edge

    // Draw the circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

function drawBlack()
{
    let arrV = ['1', '2', '3', '4', '5', '6', '7', '8'];
    let arrC = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    let count = 0;
    for(let i = 700, x = 0;i >= 0; i-=100, x+=100) 
    {
        count++;
        for (let j = 700, y = 0; j >= 0; j-=100, y+=100)
        {
            var count1 = x / 100;
            var count2 = y / 100;
            if (pieces[count2][count1].color != null)
                {
                    if (pieces[count2][count1].name == "King")
                    {
                        if (count % 2 == 1)
                            ctx.fillStyle = "antiquewhite";
                        else if (count % 2 == 0)
                            ctx.fillStyle = "burlywood";
                        ctx.fillRect(i, j, 100, 100);
                        if (pieces[count2][count1].checked == 1)
                            drawCheck(pieces[count2][count1]);
                    }
                    draw(i, j, "/static/srcs/chess/" + pieces[count2][count1].img);
                }
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

function drawWhite()
{
    var arrV = ['8', '7', '6', '5', '4', '3', '2', '1'];
	var arrC = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var count = 0;
    for(let i= 0;i < 800; i+=100) 
    {
        count++;
        for (let j = 0; j < 800; j+=100)
        {
            var count1 = i / 100;
            var count2 = j / 100;
            if (pieces[count2][count1].color != null)
            {
                if (pieces[count2][count1].name == "King")
                {
                    if (count % 2 == 1)
                        ctx.fillStyle = "antiquewhite";
                    else if (count % 2 == 0)
                        ctx.fillStyle = "burlywood";
                    ctx.fillRect(i, j, 100, 100);
                    if (pieces[count2][count1].checked == 1)
                        drawCheck(pieces[count2][count1]);
                }
                draw(i, j, "/static/srcs/chess/" + pieces[count2][count1].img);
            }
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

//CLASSIC DRAW FUNCTIONS
function drawChess(ctx)
{
    drawFallenPieces();
    console.log(pieces);
    ctx.font = '16px Arial';
    if (color == "black")
        drawBlack();
    else
        drawWhite();
}

function drawCheckers(ctx)
{
    var arrV = ['8', '7', '6', '5', '4', '3', '2', '1'];
	var arrC = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    var count = 0;
    ctx.font = '16px Arial';
    if (color == "black")
    {
        arrV = ['1', '2', '3', '4', '5', '6', '7', '8'];
        arrC = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
        for(var i = 700;i >= 0; i-=100) 
        {
            count++;
            for (var j = 700; j >= 0; j-=100)
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
    else
    {
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
}

//REDRAW FUNCTIONS
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
                reDrawPossibleCaptureMove(i, j, context);
        }
    }
}

function reDrawPossibleCaptureMove(x, y, context)
{
    if (color == "black")
    {
        x = 7 - x;
        y = 7 - y;
    }
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