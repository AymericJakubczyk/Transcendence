pongSocket = null;

function join_pong_ai_game(game_data) {
    console.log("[JOIN PONG AI GAME]", game_data);
    if (pongSocket)
        pongSocket.close()
    if (window.location.protocol == "https:")
        pongSocket = new WebSocket('wss://' + window.location.host + `/ws/pong/local/vs-ia/${game_data.id}/`);
    else
        pongSocket = new WebSocket('ws://' + window.location.host + `/ws/pong/local/vs-ia/${game_data.id}/`);

    pongSocket.onopen = function() {
        console.log('[WS PONG AI] WebSocket PONG AI connection established.');
    };

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        receive_pong_ws(data)
    }

    pongSocket.onclose = (event) => {
        console.log("[WS PONG AI] The connection has been closed successfully.");
        pongSocket = null;
    }
}

function receive_pong_ws(data) {
    console.log("[RECEIVE PONG WS]", data);
    if (data.type === 'game_update') {
        x = data.x;
        y = data.y;
        dx = data.dx;
        dy = data.dy;
        paddle_1.position.y = data.paddle1_y;
        paddle_2.position.y = data.paddle2_y;
        paddle_1Light.position.y = data.paddle1_y;
        paddle_2Light.position.y = data.paddle2_y;
        document.getElementById("player1Score").innerHTML = data.score_player1;
        document.getElementById("player2Score").innerHTML = data.score_player2;

        if (paddle_1Light.intensity > 5)
            paddle_1Light.intensity -= 5
        if (paddle_2Light.intensity > 5)
            paddle_2Light.intensity -= 5
        if (light_bump_effect_wall.intensity > 0)
            light_bump_effect_wall.intensity -= 2

        render_ball(x, y);
    }
    if (data.type == 'bump') {
        if (data.object == 'paddle') {
            if (data.player == 1)
                paddle_1Light.intensity = 50
            else
                paddle_2Light.intensity = 50
        }
        if (data.object == 'wall') {
            light_bump_effect_wall.position.set(data.x, data.y, 3)
            light_bump_effect_wall.intensity = 20
        }
        if (data.object == 'ball')
            explodeBall()
    }
    if (data.type === 'end_game') {
        console.log("[END GAME]", data);
        if (light_bump_effect_wall.intensity > 0) {
            light_bump_effect_wall.intensity = 0
            renderer.render(scene, camera);
        }
        display_endgame(data.score_player1, data.score_player2);
        change_game_headbar("Game", "/game/");
    }
    if (data.type === 'countdown') {
        console.log("[COUNTDOWN]", data);
        countdownElement = document.getElementById("countdown")
        countdownElement.style.opacity = 1;
        countdownElement.style.fontSize = "100px";
        countdownElement.innerHTML = data.countdown;
        if (data.countdown == "GO") {
            var fadeEffect = setInterval(function () {  
                if (countdownElement.style.opacity > 0) {
                    countdownElement.style.opacity -= 0.05;
                    countdownElement.style.fontSize = parseInt(countdownElement.style.fontSize) - 5 + "px";
                } else {
                    clearInterval(fadeEffect);
                }
            }, 50);
        }
    }
}

function display_endgame( player1Score, player2Score) {
    // Éléments du DOM pour le gagnant et le perdant
    var winnerScoreElement = document.getElementById("winnerScore");
    var loserScoreElement = document.getElementById("loserScore");
    var winnerNameElement = document.getElementById("winnerName");
    var loserNameElement = document.getElementById("loserName");
    var winnerPpElement = document.getElementById("winnerpp");
    var loserPpElement = document.getElementById("loserpp");
    var winnerRankElement = document.getElementById("winnerRank");
    var loserRankElement = document.getElementById("loserRank");

    // Élément pour l'écran de fin de jeu
    var endgame = document.getElementById("endgame");

    // Données par défaut pour l'IA
    var aiName = "IA";
    var aiProfilePic = "/static/srcs/assets/ai.webp"; // Chemin vers une image par défaut pour l'IA
    var aiRank = "500"; // Ou tout autre valeur par défaut

    // Récupérer les données du joueur humain
    var playerProfilePic = document.getElementById("winnerpp").src; // Assurez-vous que cet élément existe
    var playerRank = document.getElementById("winnerRank").innerHTML; // Assurez-vous que cet élément existe
    var playerName = document.getElementById("winnerName").innerHTML; // Assurez-vous que cet élément existe


    if (player1Score > player2Score) {
        // Le joueur humain gagne
        winnerScoreElement.innerHTML = player1Score;
        loserScoreElement.innerHTML = player2Score;
        winnerNameElement.innerHTML = playerName;
        loserNameElement.innerHTML = aiName;
        winnerPpElement.src = playerProfilePic;
        loserPpElement.src = aiProfilePic;
        winnerRankElement.innerHTML = playerRank;
        loserRankElement.innerHTML = aiRank;
    } else {
        // L'IA gagne
        winnerScoreElement.innerHTML = player2Score;
        loserScoreElement.innerHTML = player1Score;
        winnerNameElement.innerHTML = aiName;
        loserNameElement.innerHTML = playerName;
        winnerPpElement.src = aiProfilePic;
        loserPpElement.src = playerProfilePic;
        winnerRankElement.innerHTML = aiRank;
        loserRankElement.innerHTML = playerRank;
    }

    // Afficher l'écran de fin de jeu
    endgame.style.display = "flex";
}


function send_input_move(move, pressed) {
    const obj = {
        'type': 'move_paddle',
        'move': move,
        'pressed': pressed
    };
    if (pongSocket)
        pongSocket.send(JSON.stringify(obj))
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowUp") {
        send_input_move('up', true);
    } else if (event.key === "ArrowDown") {
        send_input_move('down', true);
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "ArrowUp") {
        send_input_move('up', false);
    } else if (event.key === "ArrowDown") {
        send_input_move('down', false);
    }
});

function join_ai_pong(game)
{   
    console.log("start ai pong", game.id)
    current_player = 1
    join_pong_ai_game(game)

    upPressed = false
    downPressed = false
    resetBall()

    let cmd1 = document.getElementById("cmd1")
    let cmd2 = document.getElementById("cmd2")

    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);

    document.addEventListener("keydown", keyDownHandler_ranked);
    document.addEventListener("keyup", keyUpHandler_ranked);

    display3D()
    // display_ranked(game, you)
}