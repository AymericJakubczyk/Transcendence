pongSocket = null;
countdownInterval = null;


function search_pong_game()
{
    pongSocket = new WebSocket('ws://' + window.location.host + '/ws/pong/');

    pongSocket.onopen = function() {
		console.log('[WS PONG] WebSocket PONG connection established.');
	};

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.type === 'end_game')
        {
            console.log("[END GAME]", data);
            display_endgame(data.player1, data.player2, data.score_player1, data.score_player2);
            return;
        }
        if (!data.game_id)
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
            return;
        }
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

    chatSocket.onclose = (event) => {
		console.log("[WS PONG] The connection has been closed successfully.");
	}
}

function display_endgame(player1, player2, player1Score, player2Score)
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
    }
    else
    {
        document.getElementById("winnerScore").innerHTML = player1Score;
        document.getElementById("loserScore").innerHTML = player2Score;
    }
    endgame = document.getElementById("endgame")
    endgame.style.display = "flex";

    
    // document.getElementById("gameContainer").style.position = "relative";
    // document.getElementById("gameContainer").appendChild(endgame);

}


function start_ranked_pong(game, you)
{   
    console.log("[LOG START]", you)
    if (gameInterval)
        clearInterval(gameInterval)
    if (countdownInterval)
        clearInterval(countdownInterval)
    console.log("start ranked pong", game.game_id)
    // do API request for get all info about the game
    const response = fetch("/initialize-game/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            game_id : game.game_id,
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("[API]", data);
        dx = data.dx
        dy = data.dy
     });
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

