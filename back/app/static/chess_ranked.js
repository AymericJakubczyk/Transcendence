chessSocket = null;

function create_chess_ws(game_id)
{
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
        }
		if (data.type == "error")
			error_message(data.message, 2000);
    }

    chatSocket.onclose = (event) => {
		console.log("[WS CHESS] The connection has been closed successfully.");
	}
}