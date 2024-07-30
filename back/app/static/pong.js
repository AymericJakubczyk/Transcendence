document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");

    const paddleWidth = 10;
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
        context.fillStyle = "#0095DD";
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

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawField();
        drawBall();
        drawPlayerPaddle();
        drawOpponentPaddle();

        // Ball collision with top and bottom walls
        if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
            dy = -dy;
        }

        // Ball collision with player's paddle (right side)
        if (x + dx > canvas.width - paddleWidth - 10 - ballRadius) {
            if (y > playerPaddleY && y < playerPaddleY + paddleHeight) {
                dx = -dx;

                // Adjust dy based on where the ball hit the paddle
                let hitPos = y - (playerPaddleY + paddleHeight / 2);
                dy = hitPos * 0.35;

                // Limit the maximum speed
                const maxSpeed = 5;
                if (Math.abs(dy) > maxSpeed) dy = maxSpeed * Math.sign(dy);
                if (Math.abs(dx) > maxSpeed) dx = maxSpeed * Math.sign(dx);
            } else {
                resetBall();
            }
        }

        // Ball collision with opponent's paddle (left side)
        if (x + dx < paddleWidth + 10 + ballRadius) {
            if (y > opponentPaddleY && y < opponentPaddleY + paddleHeight) {
                dx = -dx;

                // Adjust dy based on where the ball hit the paddle
                let hitPos = y - (opponentPaddleY + paddleHeight / 2);
                dy = hitPos * 0.35;

                // Limit the maximum speed
                const maxSpeed = 5;
                if (Math.abs(dy) > maxSpeed) dy = maxSpeed * Math.sign(dy);
                if (Math.abs(dx) > maxSpeed) dx = maxSpeed * Math.sign(dx);
            } else {
                resetBall();
            }
        }

        // Move player's paddle up or down
        if (upPressed && playerPaddleY > 0) {
            playerPaddleY -= 7;
        } else if (downPressed && playerPaddleY < canvas.height - paddleHeight) {
            playerPaddleY += 7;
        }

        // Move opponent's paddle up or down
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
        dx = 2 * (Math.random() > 0.5 ? 1 : -1); // Randomize initial direction
        dy = 2 * (Math.random() > 0.5 ? 1 : -1);
    }

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

    setInterval(draw, 10);
});
