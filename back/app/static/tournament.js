
pongTournamentSocket = null
let count = 0;

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
        document.getElementById("tournament_count").innerHTML = data.tournamentNB;
        // document.getElementById("tournament_players").style.display = "block";
        addPlayer(data);
    }
    if (data.action =="leave")
    {
        console.log("LEAVE", data)
        const element = document.getElementById(data.user_username);
        if (element != null)
            element.remove();
        document.getElementById("tournament_count").innerHTML = data.tournamentNB;
        setColor();
    }
    if (data.type == "update_room")
    {
        htmx.ajax('GET', '/game/pong/tournament/', {target:'#page', swap:'innerHTML'})
    }
}

function generateColor() {
    let color;

    if (count % 2 == 0)
        color = "#982efc";
    else
        color = "#fc952e";
    count++;
    return color;
}

function setColor() {
    console.log("SET COLOR")
    const players = document.querySelectorAll('.playersList .player');

    players.forEach((player, index) => {
        player.style.backgroundColor = generateColor();
    });

    // document.addEventListener("DOMContentLoaded", () => {
    //     const players = document.querySelectorAll('.playersList .player');

    //     players.forEach((player, index) => {
    //         player.style.backgroundColor = generateColor();
    //     });
    // });
}

function addPlayer(data) {
    document.getElementById("playersList").innerHTML += `
    <div class="player" id="${data.user_username}">
        <div class="imageFrame">
            <img src="${data.profile_pic}" alt="Profile Picture" class="pp" style="margin : 2px;">
        </div>
        <div class="infosPlayer">
            <div class="playerInfo">
                <h6 class="infoP">Player : ${data.user_username}</h6>
                <h6 class="infoP">Elo : ${data.user_rank}</h6>
            </div>
        </div>
    </div>
    `;
    setColor();
}

function cancel_waiting_tournament_game(game_id)
{
    pongSocket.close();
    pongSocket = null;
    htmx_request("/game/pong/tounament/cancel/"+ game_id + "/", "GET", {})
}