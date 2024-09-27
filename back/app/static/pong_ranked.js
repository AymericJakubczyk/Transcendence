pongSocket = null;
countdownInterval = null;


function search_pong_game()
{
    pongSocket = new WebSocket('ws://' + window.location.host + '/ws/pong/');

    pongSocket.onopen = function() {
		console.log('[WS CHESS] WebSocket CHESS connection established.');
	};

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log("[RECEIVE MATCH FOUND]", data);
        // document.getElementById("text").innerHTML = "Match found with " + data.adversaire + " !";
        redirect = document.createElement("a")
        redirect.setAttribute("hx-get", window.location.href + data.game_id + "/");
        redirect.setAttribute("hx-push-url", "true");
        redirect.setAttribute("hx-target", "#page");
        redirect.setAttribute("hx-swap", "innerHTML");
        redirect.setAttribute("hx-indicator", "#content-loader");
        htmx.process(redirect);
        document.getElementById("page").appendChild(redirect);
        redirect.click();
    }

    chatSocket.onclose = (event) => {
		console.log("[WS CHESS] The connection has been closed successfully.");
	}
}

function start_ranked_pong(game_id)
{
    console.log("start ranked pong", game_id)
    // do API request for get all info about the game
    const response = fetch("/initialize-game/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            game_id : game_id,
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

    countdownInterval = setInterval(countdown, 1000);
}

function countdown()
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
        launch_pong_ranked_game()
    }
}

function launch_pong_ranked_game()
{
    gameInterval = setInterval(calculBall, 10);
}

