pongSocket = null;


function search_pong_game()
{
    pongSocket = new WebSocket('ws://' + window.location.host + '/ws/pong/');

    pongSocket.onopen = function() {
		console.log('[WS PONG] WebSocket PONG connection established.');
        const obj = {
            'type': 'search',
        };
        pongSocket.send(JSON.stringify(obj))
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

function join_pong_game()
{
    console.log("[JOIN PONG GAME]")
    pongSocket = new WebSocket('ws://' + window.location.host + '/ws/pong/');

    pongSocket.onopen = function() {
		console.log('[WS PONG] WebSocket PONG connection established.');
        const obj = {
            'type': 'join',
            'game_id': window.location.pathname.split("/")[4]
        };
        pongSocket.send(JSON.stringify(obj))
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
    if (data.type === 'match_found' || data.type === 'join_game')
    {
        htmx_request("/game/pong/ranked/" + data.game_id + "/", "GET", {})
    }
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
        console.log("[END GAME]", data);
        if (light_bump_effect_wall.intensity > 0)
        {
            light_bump_effect_wall.intensity = 0
            renderer.render(scene, camera);
        }
        display_endgame(data.player1, data.player2, data.score_player1, data.score_player2, data.win_elo_p1, data.win_elo_p2);
    }
    if (data.type === 'countdown')
    {
        console.log("[COUNTDOWN]", data);
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
            gameInterval = setInterval(function() { catch_input(data.player) }, 10);
        }
    }
}



function display_endgame(player1, player2, player1Score, player2Score, win_elo_p1, win_elo_p2)
{
    if (player2Score > player1Score)
    {
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
    }
    else
    {
        document.getElementById("winnerScore").innerHTML = player1Score;
        document.getElementById("loserScore").innerHTML = player2Score;
        document.getElementById("winnerRank").innerHTML += "<span style='color:green'> +"+win_elo_p1+"</span>";
        document.getElementById("loserRank").innerHTML += "<span style='color:red'> "+win_elo_p2+"</span>";
    }
    endgame = document.getElementById("endgame")
    endgame.style.display = "flex";
}


function start_ranked_pong(game, you)
{   
    console.log("[LOG START]", you)
    if (gameInterval)
        clearInterval(gameInterval)
    console.log("start ranked pong", game.game_id)
    if (!pongSocket)
        join_pong_game()
    // do API request for get all info about the game
    // const response = fetch("/initialize-game/", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "X-CSRFToken": csrftoken,
    //     },
    //     body: JSON.stringify({
    //         game_id : game.game_id,
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log("[API]", data);
    //     dx = data.dx
    //     dy = data.dy
    //  });
    data = null

    playerScore = 0;
    opponentScore = 0;
    ballDirection = (Math.random() > 0.5 ? 1 : -1);
    nbrHit = 0;
    upPressed = false
    downPressed = false
    updateScore()
    resetBall()

    let cmd1 = document.getElementById("cmd1")
    let cmd2 = document.getElementById("cmd2")

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    function keyDownHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp")
        {
            cmd1.classList.add("pressed")
            upPressed = true;
        }
        else if (e.key === "Down" || e.key === "ArrowDown")
        {
            cmd2.classList.add("pressed")
            downPressed = true;
        }
        else if (e.key === "Left" || e.key === "ArrowLeft")
        {
            cmd1.classList.add("pressed")
            upPressed = true;
        }
        else if (e.key === "Right" || e.key === "ArrowRight")
        {
            cmd2.classList.add("pressed")
            downPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp")
        {
            cmd1.classList.remove("pressed")
            upPressed = false;
        }
        else if (e.key === "Down" || e.key === "ArrowDown")
        {
            cmd2.classList.remove("pressed")
            downPressed = false;
        }
        else if (e.key === "Left" || e.key === "ArrowLeft")
        {
            cmd1.classList.remove("pressed")
            upPressed = false;
        }
        else if (e.key === "Right" || e.key === "ArrowRight")
        {
            cmd2.classList.remove("pressed")
            downPressed = false;
        }
    }

    display3D()
    display_ranked(game, you)
}

function catch_input(player)
{
    if (upPressed)
        move_paddle("up", player)
    else if (downPressed)
        move_paddle("down", player)  
}

function display_ranked(game, you)
{
    reverse = false
    if (you == game.player2)
        reverse_cam()
}

function move_paddle(move, player)
{
    // =================== via API ===================
    // game_id = window.location.pathname.split("/")[4]
    // console.log("move paddle", move, game_id)
    // if (game.player1 == you)
    // {
    //     const response = fetch("/move-paddle/", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "X-CSRFToken": csrftoken,
    //         },
    //         body: JSON.stringify({
    //             'game_id' : game_id,
    //             'player' : 1,
    //             'move' : move
    //         })
    //     })
    // }
    // else
    // {
    //     const response = fetch("/move-paddle/", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "X-CSRFToken": csrftoken,
    //         },
    //         body: JSON.stringify({
    //             'game_id' : game_id,
    //             'player' : 2,
    //             'move' : move
    //         })
    //     })
    // }


    // =================== via WebSocket ===================
    const obj = {
        'type': 'move_paddle',
        'player': player,
        'move': move
    };
    pongSocket.send(JSON.stringify(obj))
}

