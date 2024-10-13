pongSocket = null;
countdownInterval = null;


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
    if (data.type === 'match_found')
    {
        console.log("[RECEIVE MATCH FOUND]", data);
        document.getElementById("text").innerHTML = "Match found with " + data.adversaire + " !";
        redirect = document.createElement("a")
        redirect.setAttribute("hx-get", window.location.pathname + data.game_id + "/");
        redirect.setAttribute("hx-push-url", "true");
        redirect.setAttribute("hx-target", "#page");
        redirect.setAttribute("hx-swap", "innerHTML");
        redirect.setAttribute("hx-indicator", "#content-loader");
        htmx.process(redirect);
        document.getElementById("page").appendChild(redirect);
        redirect.click();
        // redirect_path = window.location.pathname + data.game_id + "/"
        // history.pushState(null, '', redirect_path);
        // htmx.ajax('GET', redirect_path, {
        //     target: '#page',
        //     swap: 'innerHTML'
        // })
    }
    if (data.type === 'join_game')
    {
        console.log("[JOIN GAME]", data);
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

        render_ball(x, y);
    }
    if (data.type === 'end_game')
    {
        console.log("[END GAME]", data);
        display_endgame(data.player1, data.player2, data.score_player1, data.score_player2, data.win_elo_p1, data.win_elo_p2);
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
    if (countdownInterval)
        clearInterval(countdownInterval)
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
    
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    function keyDownHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp")
            upPressed = true;
        else if (e.key === "Down" || e.key === "ArrowDown")
            downPressed = true;
        else if (e.key === "w" || e.key === "W")
            wPressed = true;
        else if (e.key === "s" || e.key === "S")
            sPressed = true;
    }

    function keyUpHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp")
            upPressed = false;
        else if (e.key === "Down" || e.key === "ArrowDown")
            downPressed = false;
        else if (e.key === "w" || e.key === "W")
            wPressed = false;
        else if (e.key === "s" || e.key === "S")
            sPressed = false;
    }

    display3D()
    display_ranked(game, you)

    countdownInterval = setInterval(function() { countdown(game, you) }, 1000);
}

function countdown(game, you)
{
    countdownElement = document.getElementById("countdown")
    console.log("countdown", countdownElement.innerHTML)
    if (countdownElement.innerHTML == "3")
        countdownElement.innerHTML = "2"
    else if (countdownElement.innerHTML == "2")
        countdownElement.innerHTML = "1"
    else if (countdownElement.innerHTML == "1")
        countdownElement.innerHTML = "GO"
    else if (countdownElement.innerHTML == "GO")
    {
        countdownElement.innerHTML = ""
        clearInterval(countdownInterval);
        // launch_pong_ranked_game()
        gameInterval = setInterval(function() { catch_input(game, you) }, 10);
    }
}

function catch_input(game, you)
{
    if (upPressed)
        move_paddle("up", game, you)
    else if (downPressed)
        move_paddle("down", game, you)
    else if (wPressed)
        move_paddle("w", game, you)
    else if (sPressed)
        move_paddle("s", game, you)
    
}

function display_ranked(game, you)
{
    if (you == game.player2)
        reverse_cam()
}

function move_paddle(move, game, you)
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
        'player': 1,
        'move': move
    };
    if (game.player2 == you)
        obj.player = 2
    pongSocket.send(JSON.stringify(obj))
}

