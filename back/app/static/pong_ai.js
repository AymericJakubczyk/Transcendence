let pongSocket = null;

function join_pong_ai_game() {
    if (pongSocket)
        pongSocket.close()
    if (window.location.protocol == "https:")
        pongSocket = new WebSocket('wss://' + window.location.host + `/ws/pong/ai/`);
    else
        pongSocket = new WebSocket('ws://' + window.location.host + `/ws/pong/ai/`);

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
        display_endgame(data.player1, data.player2, data.score_player1, data.score_player2, data.win_elo_p1, data.win_elo_p2);
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

function display_endgame(player1, player2, player1Score, player2Score, win_elo_p1, win_elo_p2) {
    if (player2Score > player1Score) {
        document.getElementById("winnerScore").innerHTML = player2Score;
        document.getElementById("loserScore").innerHTML = player1Score;
        document.getElementById("winnerName").innerHTML = player2;
        document.getElementById("loserName").innerHTML = player1;
        stock_src = document.getElementById("winnerpp").src;
        document.getElementById("winnerpp").src = document.getElementById("loserpp").src;
        document.getElementById("loserpp").src = stock_src;
        stock_rank = document.getElementById("winnerRank").innerHTML;
        document.getElementById("winnerRank").innerHTML = document.getElementById("loserRank").innerHTML;
        document.getElementById("loserRank").innerHTML = stock_rank;
        document.getElementById("winnerRank").innerHTML += "<span style='color:green'> +"+win_elo_p2+"</span>";
        document.getElementById("loserRank").innerHTML += "<span style='color:red'> "+win_elo_p1+"</span>";
    } else {
        document.getElementById("winnerScore").innerHTML = player1Score;
        document.getElementById("loserScore").innerHTML = player2Score;
        document.getElementById("winnerRank").innerHTML += "<span style='color:green'> +"+win_elo_p1+"</span>";
        document.getElementById("loserRank").innerHTML += "<span style='color:red'> "+win_elo_p2+"</span>";
    }
    endgame = document.getElementById("endgame")
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

function join_ai_pong(game, you)
{   
    console.log("start ranked pong", game.id)
    current_player = (you == game.player1) ? 1 : 2
    join_pong_game(game, current_player)

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
    display_ranked(game, you)
}