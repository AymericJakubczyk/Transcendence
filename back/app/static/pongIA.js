moveIAInterval = IAInterval = null

function startIAGame()
{
    playerScore = 0;
    opponentScore = 0;
    ballDirection = (Math.random() > 0.5 ? 1 : -1);
    nbrHit = 0;
    upPressed = false
    downPressed = false
    updateScore()
    resetBall()

    document.getElementById("playButton").style.display = "none"; // Réafficher le bouton "JOUER"
    document.getElementById("gameContainer").style.display = "flex"; // Masquer le canevas du jeu

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    function keyDownHandler(e) {
        if (e.key === "w" || e.key === "W")
            wPressed = true;
        else if (e.key === "s" || e.key === "S")
            sPressed = true;
    }

    function keyUpHandler(e) {
        if (e.key === "w" || e.key === "W")
            wPressed = false;
        else if (e.key === "s" || e.key === "S")
            sPressed = false;
    }

    
    display3D()
    if (gameInterval)
        clearInterval(gameInterval)
    gameInterval = setInterval(calculBall, 10);
    
    // =================do IA things====================================
    // acces to the position of the IA paddle with paddle_2.position.y
    // acces to ball postion with ball.position.x and ball.position.y
    // acces to the direction of ball with dx and dy
    // acces to the size of the gameboard with arenaWidth and arenaLength

    IAInterval = setInterval(
        ()=>{
            console.log("[LOG]", paddle_2.position.y, ball.position.x, ball.position.y, dx, dy);
            moveTo(ball.position.y)
        }, 1000)
}


function moveTo(value)
{
    clearInterval(moveIAInterval)
    upPressed = false
    downPressed = false
    if (paddle_2.position.y < value)
    {
        upPressed = true
        moveIAInterval = setInterval(
            ()=>{
                if (paddle_2.position.y >= value)
                {
                    upPressed = false
                    clearInterval(moveIAInterval)
                }
            },10)
    }
    else
    {
        downPressed = true
        moveIAInterval = setInterval(
            ()=>{
                if (paddle_2.position.y <= value)
                {
                    downPressed = false
                    clearInterval(moveIAInterval)
                }
            },10)
    }
}