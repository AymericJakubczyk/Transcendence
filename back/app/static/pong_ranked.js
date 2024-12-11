pongSocket = null;

function join_pong_game(game_data, player)
{
    if (pongSocket)
        return;
    if (window.location.protocol == "https:")
        pongSocket = new WebSocket('wss://' + window.location.host + `/ws/pong/${game_data.id}/`);
    else
        pongSocket = new WebSocket('ws://' + window.location.host + `/ws/pong/${game_data.id}/`);

    pongSocket.onopen = function() {
		console.log('[WS PONG] WebSocket PONG connection established.');
	};

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        receive_pong_ws(data)
    }

    pongSocket.onclose = (event) => {
		console.log("[WS PONG] The connection has been closed successfully.");
        pongSocket = null;
	}
}

function receive_pong_ws(data)
{
    if (data.type === 'game_update')
    {
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
    if (data.type == 'bump')
    {
        if (data.object == 'paddle')
        {
            if (data.player == 1)
                paddle_1Light.intensity = 50
            else
                paddle_2Light.intensity = 50
        }
        if (data.object == 'wall')
        {
            light_bump_effect_wall.position.set(data.x, data.y, 3)
            light_bump_effect_wall.intensity = 20
        }
        if (data.object == 'ball')
            explodeBall()
    }
    if (data.type === 'end_game')
    {
        console.log("[END GAME PONG RANKED]", data)
        if (light_bump_effect_wall.intensity > 0)
        {
            light_bump_effect_wall.intensity = 0
            renderer.render(scene, camera);
        }
        display_endgame(data.score_player1, data.score_player2, data.player1_rank, data.player2_rank, data.win_elo_p1, data.win_elo_p2);
        change_game_headbar("Game", "/game/");
    }
    if (data.type === 'countdown')
    {
        if (document.getElementById("cancel_tounament_game"))
            document.getElementById("cancel_tounament_game").remove();
        countdownElement = document.getElementById("countdown")
        countdownElement.style.opacity = 1;
        countdownElement.style.fontSize = "100px";
        countdownElement.innerHTML = data.countdown;
        if (data.countdown == "GO")
        {
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



function display_endgame(player1Score, player2Score, player1_rank, player2_rank, win_elo_p1, win_elo_p2)
{
    if (player2Score > player1Score)
    {
        document.getElementById("winnerScore").innerHTML = player2Score;
        document.getElementById("loserScore").innerHTML = player1Score;
		stock = document.getElementById("loser").innerHTML
		document.getElementById("loser").innerHTML = document.getElementById("winner").innerHTML;
		document.getElementById("winner").innerHTML = stock;

		parent_p2 = document.getElementById("winner");
		parent_p2.querySelector("#rank").innerHTML = player2_rank + "<span style='color:green'> +"+win_elo_p2+"</span>";
		parent_p1 = document.getElementById("loser");
		parent_p1.querySelector("#rank").innerHTML = player1_rank + "<span style='color:red'> "+win_elo_p1+"</span>";
	}
	else
	{
        document.getElementById("winnerScore").innerHTML = player1Score;
        document.getElementById("loserScore").innerHTML = player2Score;
		parent_p1 = document.getElementById("winner");
		parent_p1.querySelector("#rank").innerHTML = player1_rank + "<span style='color:green'> +"+win_elo_p1+"</span>";
		parent_p2 = document.getElementById("loser");
		parent_p2.querySelector("#rank").innerHTML = player2_rank + "<span style='color:red'> "+win_elo_p2+"</span>";
    }
    endgame = document.getElementById("endgame")
    endgame.style.display = "flex";
}


function join_ranked_pong(game, you)
{   
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


function display_ranked(game, you)
{
    reverse = false
    if (you == game.player2)
        reverse_cam()
}

function send_input_move(move, pressed)
{
    const obj = {
        'type': 'move_paddle',
        'move': move,
        'pressed': pressed
    };
    if (!pongSocket || pongSocket.readyState != WebSocket.OPEN)
		error_message("Connection with websocket lost, please refresh the page", 2000)
    if (pongSocket)
        pongSocket.send(JSON.stringify(obj))
}

