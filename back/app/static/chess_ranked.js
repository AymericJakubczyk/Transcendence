chessSocket = null;

function create_chess_ws(game_id)
{
	if (chessSocket)
		return;
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
			decline_draw();
			move_piece(data.from, data.to.x, data.to.y);
			if (data.promotion)
				do_promotion_move(data.promotion, data.to.x, data.to.y);
			if (document.getElementById("promotion"))
				document.getElementById("promotion").remove();
			player = player == "white" ? "black" : "white";
        }
		if (data.type == "end_game")
		{
			display_chess_endgame(data.winner, data.reason, data.white_elo, data.black_elo, data.white_elo_win, data.black_elo_win);
			change_game_headbar("Game", "/game/");
		}
		if (data.type == "propose_draw")
			offer_draw();
		if (data.type == "error")
			error_message(data.message, 2000);
    }

    chatSocket.onclose = (event) => {
		console.log("[WS CHESS] The connection has been closed successfully.");
		chatSocket = null;
	}
}


function display_chess_endgame(winner, reason, white_elo, black_elo, white_elo_win, black_elo_win)
{
	document.getElementById("reason_endgame").innerHTML = reason;

	if (winner == "draw" || winner == 0)
	{
		elem = document.getElementById("loser")
		elem.classList.remove("loser_endgame");
		elem.classList.add("winner_endgame");

		elem.querySelector("#rank").innerHTML = black_elo;
		if (black_elo_win >= 0)
			elem.querySelector("#rank").innerHTML += "<span style='color:green'> +"+black_elo_win+"</span>";
		else
			elem.querySelector("#rank").innerHTML += "<span style='color:red'> "+black_elo_win+"</span>";

		elem = document.getElementById("winner")
		elem.querySelector("#rank").innerHTML = white_elo;
		if (white_elo_win >= 0)
			elem.querySelector("#rank").innerHTML += "<span style='color:green'> +"+white_elo_win+"</span>";
		else
			elem.querySelector("#rank").innerHTML += "<span style='color:red'> "+white_elo_win+"</span>";
	}
	else if (winner == "black")
	{
		document.getElementById("result").innerHTML = "BLACK WIN";
		stock = document.getElementById("loser").innerHTML
		document.getElementById("loser").innerHTML = document.getElementById("winner").innerHTML;
		document.getElementById("winner").innerHTML = stock;

		parent_black = document.getElementById("winner");
		parent_black.querySelector("#rank").innerHTML = black_elo;
		parent_black.querySelector("#rank").innerHTML += "<span style='color:green'> +"+black_elo_win+"</span>";


		parent_white = document.getElementById("loser");
		parent_white.querySelector("#rank").innerHTML = white_elo;
		parent_white.querySelector("#rank").innerHTML += "<span style='color:red'> "+white_elo_win+"</span>";
	}
	else if (winner == "white")
	{
		document.getElementById("result").innerHTML = "WHITE WIN";
		parent_white = document.getElementById("winner");
		parent_white.querySelector("#rank").innerHTML = white_elo;
		parent_white.querySelector("#rank").innerHTML += "<span style='color:green'> +"+white_elo_win+"</span>";

		parent_black = document.getElementById("loser");
		parent_black.querySelector("#rank").innerHTML = black_elo;
		parent_black.querySelector("#rank").innerHTML += "<span style='color:red'> "+black_elo_win+"</span>";
	}

	document.getElementById("chess_endgame").style.display = "flex";
}


function resign()
{
	if (!chessSocket || chessSocket.readyState != WebSocket.OPEN)
		error_message("Connection with websocket lost, please refresh the page", 2000)
	if (chessSocket)
		chessSocket.send(JSON.stringify({'type': 'resign'}));
}


function propose_draw()
{
	if (!chessSocket || chessSocket.readyState != WebSocket.OPEN)
		error_message("Connection with websocket lost, please refresh the page", 2000)
	if (chessSocket)
		chessSocket.send(JSON.stringify({'type': 'propose_draw'}));
}

function accept_draw()
{
	if (!chessSocket || chessSocket.readyState != WebSocket.OPEN)
		error_message("Connection with websocket lost, please refresh the page", 2000)
	if (chessSocket)
		chessSocket.send(JSON.stringify({'type': 'accept_draw'}));
}

function decline_draw()
{
	if (!chessSocket || chessSocket.readyState != WebSocket.OPEN)
		error_message("Connection with websocket lost, please refresh the page", 2000)
	if (chessSocket)
		chessSocket.send(JSON.stringify({'type': 'decline_draw'}));
	document.getElementById("draw").remove();
	document.getElementById("myInfo").innerHTML += '<div class="rounded-pill m-1 p-1" id="draw" style="height:fit-content; background-color:burlywood; cursor:pointer" onclick="propose_draw()">Propose draw</div>'
}

function offer_draw()
{
	document.getElementById("draw").style.background = "transparent";
	// delete event listener
	document.getElementById("draw").onclick = null;
	document.getElementById("draw").removeEventListener("click", propose_draw);
	document.getElementById("draw").innerHTML = "opponent propose draw : <button class='btn btn-success' onclick='accept_draw()'>Accept</button><button class='btn btn-danger' onclick='decline_draw()'>Decline</button>";
}