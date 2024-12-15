pongAISocket = null;

function join_pong_ai_game(game_data) {
    console.log("[JOIN PONG AI GAME]", game_data);
    if (pongAISocket)
        pongAISocket.close()
    if (window.location.protocol == "https:")
        pongAISocket = new WebSocket('wss://' + window.location.host + `/ws/pong/local/vs-ia/${game_data.id}/`);
    else
        pongAISocket = new WebSocket('ws://' + window.location.host + `/ws/pong/local/vs-ia/${game_data.id}/`);

    pongAISocket.onopen = function() {
        console.log('[WS PONG AI] WebSocket PONG AI connection established.');
    };

    pongAISocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        receive_pong_ws_ai(data)
    }

    pongAISocket.onclose = (event) => {
        console.log("[WS PONG AI] The connection has been closed successfully.");
        pongAISocket = null;
    }
}

function receive_pong_ws_ai(data) {
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
        if (light_bump_effect_wall.intensity > 0) {
            light_bump_effect_wall.intensity = 0
            renderer.render(scene, camera);
        }
        display_endgame_ai(data.score_player1, data.score_player2);
        change_game_headbar("Game", "/game/");
    }
    if (data.type === 'countdown') {
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

function display_endgame_ai( player1Score, player2Score) {
    var winnerScoreElement = document.getElementById("winnerScore");
    var loserScoreElement = document.getElementById("loserScore");
    var winnerNameElement = document.getElementById("winnerName");
    var loserNameElement = document.getElementById("loserName");
    var winnerPpElement = document.getElementById("winnerpp");
    var loserPpElement = document.getElementById("loserpp");
    var winnerRankElement = document.getElementById("winnerRank");
    var loserRankElement = document.getElementById("loserRank");

    var endgame = document.getElementById("endgame");

    var aiName = "IA";
    var aiProfilePic = "/static/srcs/assets/ai.webp";
    var aiRank = "500"; 

    var playerProfilePic = document.getElementById("winnerpp").src; 
    var playerRank = document.getElementById("winnerRank").innerHTML; 
    var playerName = document.getElementById("winnerName").innerHTML; 


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


function send_input_move_ai(move, pressed) {
    const obj = {
        'type': 'move_paddle',
        'move': move,
        'pressed': pressed
    };
    if (pongAISocket)
        pongAISocket.send(JSON.stringify(obj))
}

function join_ai_pong(game)
{   
    console.log("start ai pong", game.id)
    current_player = 1
    join_pong_ai_game(game)

    upPressed = false
    downPressed = false
    resetBall()

    display3D()
    
    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    document.removeEventListener("keydown", keyDownHandler_ranked);
    document.removeEventListener("keyup", keyUpHandler_ranked);

    document.addEventListener("keydown", keyDownHandler_ai);
    document.addEventListener("keyup", keyUpHandler_ai);

}