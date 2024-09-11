document.addEventListener("DOMContentLoaded", function() {
    let gameInterval;
    let gameStarted = false;
    let playerScore = 0;
    let opponentScore = 0;
    const winningScore = 5;
    let ballDirection = 1; // 1 = vers le joueur, -1 = vers l'adversaire

    document.getElementById("playButton").addEventListener("click", function() {
        if (gameStarted) {
            stopGame();
        }
        startGame();
    });

    function startGame() {
        // Réinitialiser le score
        playerScore = 0;
        opponentScore = 0;
        updateScore();

        // Masquer le bouton "JOUER"
        document.getElementById("playButton").style.display = "none";
        document.getElementById("gameContainer").style.display = "block";

        const canvas = document.getElementById("pongCanvas");
        const context = canvas.getContext("2d");

        gameStarted = true;

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
            } else if (e.key === "z" || e.key === "Z") {
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
            } else if (e.key === "z" || e.key === "Z") {
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
                stopGame();
            }
        }

        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawField();
            drawBall();
            drawPlayerPaddle();
            drawOpponentPaddle();
            drawScore();

            if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
                dy = -dy;
            }

            if (x + dx > canvas.width - paddleWidth - 10 - ballRadius) {
                if (y > playerPaddleY && y < playerPaddleY + paddleHeight) {
                    dx = -dx;
                } else {
                    opponentScore++;
                    ballDirection = -1;
                    checkWin();
                    resetBall();
                }
            }

            if (x + dx < paddleWidth + 10 + ballRadius) {
                if (y > opponentPaddleY && y < opponentPaddleY + paddleHeight) {
                    dx = -dx;
                } else {
                    playerScore++;
                    ballDirection = 1;
                    checkWin();
                    resetBall();
                }
            }

            if (upPressed && playerPaddleY > 0) {
                playerPaddleY -= 7;
            } else if (downPressed && playerPaddleY < canvas.height - paddleHeight) {
                playerPaddleY += 7;
            }

            if (wPressed && opponentPaddleY > 0) {
                opponentPaddleY -= 7;
            } else if (sPressed && opponentPaddleY < canvas.height - paddleHeight) {
                opponentPaddleY += 7;
            }

            x += dx;
            y += dy;
        }

        function resetBall() {
            x = canvas.width / 2;
            y = canvas.height / 2;
            dx = 2 * ballDirection;
            dy = 2 * (Math.random() > 0.5 ? 1 : -1);
        }

        gameInterval = setInterval(draw, 10);
    }

    function stopGame() {
        clearInterval(gameInterval);
        gameStarted = false;
        document.getElementById("playButton").style.display = "block";
        document.getElementById("gameContainer").style.display = "none";
    }

    function updateScore() {
        document.getElementById('playerScore').innerText = `Player: ${playerScore}`;
        document.getElementById('opponentScore').innerText = `Opponent: ${opponentScore}`;
    }
});
