let gameInterval;
let gameStarted = false;
let playerScore = 0;
let opponentScore = 0;
const winningScore = 5;
let ballDirection = 1; // 1 = vers le joueur, -1 = vers l'adversaire


function startGame() {
    // Réinitialiser le score
    playerScore = 0;
    opponentScore = 0;
    updateScore();

    // Masquer le bouton "JOUER"
    document.getElementById("playButton").style.display = "none";
    // Afficher le canevas du jeu
    document.getElementById("gameContainer").style.display = "block";

    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");
    
    gameStarted = true; // Le jeu est maintenant démarré
    
    const paddleWidth = 8;
    const paddleHeight = 75;
    const ballRadius = 8;
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let dx = 2;
    let dy = 2;
    let upPressed = false;
    let downPressed = false;
    let wPressed = false;
    let sPressed = false;

    let playerPaddleY = (canvas.height - paddleHeight) / 2;
    let opponentPaddleY = (canvas.height - paddleHeight) / 2;
    const opponentPaddleX = 10;

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function keyDownHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp") {
            upPressed = true;
        } else if (e.key === "Down" || e.key === "ArrowDown") {
            downPressed = true;
        } else if (e.key === "w" || e.key === "W") {
            wPressed = true;
        } else if (e.key === "s" || e.key === "S") {
            sPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp") {
            upPressed = false;
        } else if (e.key === "Down" || e.key === "ArrowDown") {
            downPressed = false;
        } else if (e.key === "w" || e.key === "W") {
            wPressed = false;
        } else if (e.key === "s" || e.key === "S") {
            sPressed = false;
        }
    }

    function drawField() {
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "#FFFFFF";
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        context.beginPath();
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        context.stroke();
        context.closePath();
    }

    function drawBall() {
        context.beginPath();
        context.arc(x, y, ballRadius, 0, Math.PI * 2);
        context.fillStyle = "#FF5E5E";
        context.fill();
        context.closePath();
    }

    function drawPlayerPaddle() {
        context.beginPath();
        context.rect(canvas.width - paddleWidth - 10, playerPaddleY, paddleWidth, paddleHeight);
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
    }

    function drawOpponentPaddle() {
        context.beginPath();
        context.rect(opponentPaddleX, opponentPaddleY, paddleWidth, paddleHeight);
        context.fillStyle = "#DD0000";
        context.fill();
        context.closePath();
    }

    function drawScore() {
        document.getElementById('playerScore').innerText = `Player: ${playerScore}`;
        document.getElementById('opponentScore').innerText = `Opponent: ${opponentScore}`;
    }

    function checkWin() {
        if (playerScore >= winningScore || opponentScore >= winningScore) {
            updateScore();
            drawScore();
            stopGame();
        }
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawField();
        drawBall();
        drawPlayerPaddle();
        drawOpponentPaddle();
        drawScore();  // Affichez le score en direct

        // Gestion des collisions avec les murs
        if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
            dy = -dy;
        }

        // Gestion des collisions avec les paddles
        if (x > canvas.width - paddleWidth - 10 - ballRadius) {
            if (y > playerPaddleY - (ballRadius / 2) && y < playerPaddleY + paddleHeight + (ballRadius / 2)) {
                if (dx < 0)
                    dx = dx - 0.2
                else
                    dx = dx + 0.2
                dx = -dx;
                let hitPos = y - (playerPaddleY + paddleHeight / 2);
                console.log("[HIT]", hitPos);
                dy = hitPos * 0.1;
                const maxSpeed = 5;
                if (Math.abs(dy) > maxSpeed) dy = maxSpeed * Math.sign(dy);
                if (Math.abs(dx) > maxSpeed) dx = maxSpeed * Math.sign(dx);
            } else {
                playerScore++; // Opponent marque un point
                ballDirection = -1; // Le ballon se dirige vers l'adversaire
                checkWin();
                resetBall();
            }
        }

        if (x < paddleWidth + 10 + ballRadius) {
            if (y > opponentPaddleY - (ballRadius / 2) && y < opponentPaddleY + paddleHeight + (ballRadius / 2)) {
                if (dx < 0)
                    dx = dx - 0.2
                else
                    dx = dx + 0.2
                dx = -dx;
                let hitPos = y - (opponentPaddleY + paddleHeight / 2);
                dy = hitPos * 0.1;
                const maxSpeed = 5;
                if (Math.abs(dy) > maxSpeed) dy = maxSpeed * Math.sign(dy);
                if (Math.abs(dx) > maxSpeed) dx = maxSpeed * Math.sign(dx);
            } else {
                opponentScore++; // Player marque un point
                ballDirection = 1; // Le ballon se dirige vers le joueur
                checkWin();
                resetBall();
            }
        }

        // Mouvement des paddles
        if (upPressed && playerPaddleY > 0) {
            playerPaddleY -= 3;
        } else if (downPressed && playerPaddleY < canvas.height - paddleHeight) {
            playerPaddleY += 3;
        }

        if (wPressed && opponentPaddleY > 0) {
            opponentPaddleY -= 3;
        } else if (sPressed && opponentPaddleY < canvas.height - paddleHeight) {
            opponentPaddleY += 3;
        }

        x += dx;
        y += dy;
    }

    function resetBall() {
        x = canvas.width / 2;
        y = canvas.height / 2;
        dx = 2 * ballDirection; // Direction du ballon vers le joueur qui vient de prendre un but
        dy = 2 * (Math.random() > 0.5 ? 1 : -1); // Garder un mouvement vertical aléatoire
    }

    gameInterval = setInterval(draw, 10);
}

function stopGame() {
    clearInterval(gameInterval); // Arrêter l'intervalle de jeu
    gameStarted = false; // Réinitialiser l'état du jeu
    document.getElementById("playButton").style.display = "inline"; // Réafficher le bouton "JOUER"
    document.getElementById("gameContainer").style.display = "none"; // Masquer le canevas du jeu
}

function updateScore() {
    document.getElementById('playerScore').innerText = `Player: ${playerScore}`;
    document.getElementById('opponentScore').innerText = `Opponent: ${opponentScore}`;
}