
pongTournamentSocket = null

function beautifulrangeforaymeric(){
    const value = document.getElementById("value");
    const input = document.getElementById("player_range");
    value.textContent = input.value;
    input.addEventListener("input", (event) => {
        value.textContent = event.target.value;
    });
}

function create_pong_tournament_ws()
{
    if (pongTournamentSocket != null)
        pongTournamentSocket.close();
    pongTournamentSocket = new WebSocket('ws://' + window.location.host + '/ws/pongTournament/');

    pongTournamentSocket.onopen = function() {
		console.log('[WS pongTournament] WebSocket pongTournament connection established.');
	};

    pongTournamentSocket.onmessage = function(a) {
        const data = JSON.parse(a.data);
        console.log("[NAME AND PLAYERLIST]", data);
    }
}

async function join_pong_tournament(id_tournament)
{
    pongTournamentSocket = new WebSocket('ws://' + window.location.host + '/ws/pongTournament/');

    pongTournamentSocket.onopen = function() {
		console.log('[WS pongTournament] WebSocket pongTournament connection established.');
        const obj = {
            'type': 'join',
            'id_tournament': id_tournament
        };
        pongTournamentSocket.send(JSON.stringify(obj))
	};

    pongTournamentSocket.onmessage = function(a) {
        const data = JSON.parse(a.data);
        console.log("[NAME AND PLAYERLIST]", data);

    }

    pongTournamentSocket.onclose = (event) => {
		console.log("[WS pongTournament] The connection has been closed successfully.");
	}

}