
pongTournamentSocket = null

function beautifulrangeforaymeric(){
    const value = document.getElementById("max_player_value");
    const input = document.getElementById("player_range");
    value.textContent = input.value;
    input.addEventListener("input", (event) => {
        value.textContent = event.target.value;
    });
}

function launch_tournament_error(number)
{
    if (number <= 2)
        error_message("Not enought players to start.", 2000);
}

function check_create_error()
{
    obj = document.getElementById("create_name_input");
    if (obj.value.length > 25)
        error_message("Tournament Name too long !", 2000);
}

function create_pong_tournament_ws()
{
    if (pongTournamentSocket != null)
        pongTournamentSocket.close();
    if (window.location.protocol == "https:")
        pongTournamentSocket = new WebSocket('wss://' + window.location.host + '/ws/pongTournament/');
    else
        pongTournamentSocket = new WebSocket('ws://' + window.location.host + '/ws/pongTournament/');

    pongTournamentSocket.onopen = function() {
		console.log('[WS pongTournament] WebSocket pongTournament connection established.');
	};

    pongTournamentSocket.onmessage = function(a) {
        const data = JSON.parse(a.data);
        receive_ws(data);
    }
}

function leave_pong_tournament(id_tournament)
{
    console.log("LEAVE TOURNAMENT", id_tournament)
    pongTournamentSocket.close();
    pongTournamentSocket = null;
}


function receive_ws(data)
{
    console.log("[RECEIVE WS]", data);
    if (data.action =="join")
    {
        console.log("JOIN", data)
        const div = document.getElementById("tournament_players")
        const line = document.createElement("span")
        line.setAttribute("id", data.user_username);
        const node = document.createTextNode(data.user_username + " - ("+ data.user_rank + ") / ")
        if (line != null)
            line.appendChild(node);
        if (div != null)
            div.appendChild(line);
        document.getElementById("tournament_count").innerHTML = data.tournamentNB;
    }
    if (data.action =="leave")
    {
        console.log("LEAVE", data)
        const element = document.getElementById(data.user_username);
        if (element != null)
            element.remove();
        document.getElementById("tournament_count").innerHTML = data.tournamentNB;
        
    }
    if (data.type == "update_room")
    {
        htmx.ajax('GET', '/game/pong/tournament/', {target:'#page', swap:'innerHTML'})
    }
}