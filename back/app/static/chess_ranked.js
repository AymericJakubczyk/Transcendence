chessSocket = null;

function search_game()
{
    chessSocket = new WebSocket('ws://' + window.location.host + '/ws/chess/');

    chessSocket.onopen = function() {
		console.log('[WS CHESS] WebSocket CHESS connection established.');
	};

    chessSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log("[RECEIVE MATCH FOUND]", data);
        // document.getElementById("text").innerHTML = "Match found with " + data.adversaire + " !";
        redirect = document.createElement("a")
        redirect.setAttribute("hx-get", window.location.href + data.game_id + "/");
        redirect.setAttribute("hx-push-url", "true");
        redirect.setAttribute("hx-target", "#page");
        redirect.setAttribute("hx-swap", "innerHTML");
        redirect.setAttribute("hx-indicator", "#content-loader");
        htmx.process(redirect);
        document.getElementById("page").appendChild(redirect);
        redirect.click();
    }

    chatSocket.onclose = (event) => {
		console.log("[WS CHESS] The connection has been closed successfully.");
	}
}