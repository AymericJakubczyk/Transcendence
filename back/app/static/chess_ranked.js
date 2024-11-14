chessSocket = null;

function create_chess_ws(game_id)
{
  	if (window.location.protocol == "https:")
    	chessSocket = new WebSocket('wss://' + window.location.host + `/ws/chess/${game_id}/`);
	else
		chessSocket = new WebSocket('ws://' + window.location.host + `/ws/chess/${game_id}/`);

    chessSocket.onopen = function() {
		console.log('[WS CHESS] WebSocket CHESS connection established.');
	};

    chessSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log("[RECEIVE CHESS WS]", data);
        if (data.type == "move")
        {
			move_piece(data.from, data.to.x, data.to.y);
			player = player == "white" ? "black" : "white";
			whosPlaying(player);
			if (document.getElementById("random").checked && board[data.to.y][data.to.x].piece.color != player)
				random_move(player);
        }
		if (data.type == "end_game")
		{
			display_chess_endgame(data.winner, data.reason, data.white_elo, data.black_elo, data.white_elo_win, data.black_elo_win);
		}
		if (data.type == "error")
			error_message(data.message, 2000);
    }

    chatSocket.onclose = (event) => {
		console.log("[WS CHESS] The connection has been closed successfully.");
	}
}


function display_chess_endgame(winner, reason, white_elo, black_elo, white_elo_win, black_elo_win)
{

	console.log("Display endgame", winner, reason, white_elo, black_elo, white_elo_win, black_elo_win);

	if (winner == "black")
	{
		if (winner == "white")
			document.getElementById("result").innerHTML = "WHITE WIN";
		else if (winner == "black")
			document.getElementById("result").innerHTML = "BLACK WIN";
		else
			document.getElementById("result").innerHTML = "DRAW";
		stock_name = document.getElementById("winnerName").innerHTML;
		document.getElementById("winnerName").innerHTML = document.getElementById("loserName").innerHTML;
		document.getElementById("loserName").innerHTML = stock_name;
		stock_src = document.getElementById("winnerpp").src;
		document.getElementById("winnerpp").src = document.getElementById("loserpp").src;
		document.getElementById("loserpp").src = stock_src;
		stock_rank = document.getElementById("winnerRank").innerHTML;
		document.getElementById("winnerRank").innerHTML = document.getElementById("loserRank").innerHTML;
		document.getElementById("loserRank").innerHTML = stock_rank;
		document.getElementById("winnerRank").innerHTML += "<span style='color:green'> +"+black_elo_win+"</span>";
		document.getElementById("loserRank").innerHTML += "<span style='color:red'> "+white_elo_win+"</span>";
	}
	else
	{
		document.getElementById("winnerRank").innerHTML += "<span style='color:green'> +"+white_elo_win+"</span>";
		document.getElementById("loserRank").innerHTML += "<span style='color:red'> "+black_elo_win+"</span>";
	}

	document.getElementById("chess_endgame").style.display = "flex";
}





// just for testing TO DELETE
async function random_move(player)
{
	// await sleep(2000);
	let cp_board = Array.from(board, x => x.map(y => Object.assign({}, y)));
	reset_possible_moves(cp_board)
	// define all pos of piece player
	let pos = [];
	for (let y = 0; y < 8; y++)
	{
		for (let x = 0; x < 8; x++)
		{
			if (cp_board[y][x].piece != null && cp_board[y][x].piece.color == player)
				pos.push({'x': x, 'y': y});
		}
	}
	// shuffle pos
	pos.sort(() => Math.random() - 0.5);

	for (let i = 0; i < pos.length; i++)
	{
		let x = pos[i].x;
		let y = pos[i].y;
		// define all possible move of piece
		cp_board[y][x].piece.setPossibleMoves(cp_board, x, y);
		last_verif_move(cp_board, player, {'x': x, 'y': y});
		let possible_moves = [];
		for (let i = 0; i < 8; i++)
		{
			for (let j = 0; j < 8; j++)
			{
				if (cp_board[i][j].possibleMove)
					possible_moves.push({'x': j, 'y': i});
			}
		}
		// shuffle possible moves
		possible_moves.sort(() => Math.random() - 0.5);
		for (let j = 0; j < possible_moves.length; j++)
		{
			let x_move = possible_moves[j].x;
			let y_move = possible_moves[j].y;
			// send move
			console.log("Random move", player, "from", x, y, "to", x_move, y_move);
			chessSocket.send(JSON.stringify({
				'type': 'move',
				'from': {'x': x, 'y': y},
				'to': {'x': x_move, 'y': y_move}
			}))
			return;
		}
	}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}