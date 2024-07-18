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


function drawPossibleMoove(x, y, context)
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
		if (pieces[posy][posx].value == "whitepawn")
		{
			if (posy == 6)
			{
				pieces[posy - 1][posx].state = "possibleMoove";
				pieces[posy - 2][posx].state = "possibleMoove";
			}
			else
				pieces[posy - 1][posx].state = "possibleMoove";			
		}
		else if (pieces[posy][posx].value == "blackpawn")
		{	
			if (posy == 1)
			{	
				pieces[posy + 1][posx].state = "possibleMoove";
				pieces[posy + 2][posx].state = "possibleMoove";
			}
			else
				pieces[posy + 1][posx].state = "possibleMoove";

			// drawPossibleMoove(posy + 1, posx, context);
			// drawPossibleMoove(posy + 2, posx, context);
		}
		
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
	console.log(pieces[posy][posx]);
	console.log(pieces[py][px]);
	if ((posy <= 8 || 0 >= posy) && (posx <= 8 || 0 >= posx))
	{
		console.log({posy, posx, py, px, pospiece: pieces[posy][posx]});
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
	for(var i= 0;i < 800; i+=100) 
	{
		count++;
		for (var j = 0; j < 800; j+=100)
		{
			var pos = i + j + 150;
			var count1 = i / 100;
			var count2 = j / 100;
			if (pieces[count2][count1].value != "")
				draw(i, j, "../static/srcs/chess/" + pieces[count2][count1].value + ".png");
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
				drawPossibleMoove(count2, count1, ctx);
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
console.log("led");
drawCheckers(ctx);
var pieces = new Array(8);
for (var i = 0; i < 8; i++)
	pieces[i] = new Array(8);
for (var i = 0; i < 8; i++)
{
	for (var j = 0; j < 8; j++)
		pieces[i][j] = {value: "", state: "noPossibleMoove"};
}
pieces[1][0] = pieces[1][1] = pieces[1][2] = pieces[1][3] = pieces[1][4] = pieces[1][5] = pieces[1][6] = pieces[1][7] = {value: "blackpawn", state: "noPossibleMoove"};
pieces[0][0] = pieces[0][7] = {value: "blackrook", state: "noPossibleMoove"};
pieces[0][1] = pieces[0][6] = {value: "blackknight", state: "noPossibleMoove"};
pieces[0][2] = pieces[0][5] = {value: "blackbishop", state: "noPossibleMoove"};
pieces[0][3] = {value: "blackqueen", state: "noPossibleMoove"};
pieces[0][4] = {value: "blackking", state: "noPossibleMoove"};
pieces[6][0] = pieces[6][1] = pieces[6][2] = pieces[6][3] = pieces[6][4] = pieces[6][5] = pieces[6][6] = pieces[6][7] = {value: "whitepawn", state: "noPossibleMoove"};
pieces[7][0] = pieces[7][7] = {value: "whiterook", state: "noPossibleMoove"};
pieces[7][1] = pieces[7][6] = {value: "whiteknight", state: "noPossibleMoove"};
pieces[7][2] = pieces[7][5] = {value: "whitebishop", state: "noPossibleMoove"};
pieces[7][3] = {value: "whitequeen", state: "noPossibleMoove"};
pieces[7][4] = {value: "whiteking", state: "noPossibleMoove"};

drawChess(ctx);
console.log(pieces);
canvas.addEventListener('click', function() {moovePawn(event.layerX, event.layerY, ctx)}, false);

