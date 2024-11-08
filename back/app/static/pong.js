// let gameId= null;  // Variable globale pour stocker l'ID de la partie

// let gameInterval;
// let gamePaused = false;
// let gameStarted = false;
// let playerScore = 2;
// let playerName = "Player";
// let opponentName = "Opponent";
// let opponentScore = 0;
// const winningScore = 5;
// let ballDirection = 1; // 1 = vers le joueur, -1 = vers l'adversaire

// const paddleWidth = 6;
// const paddleHeight = 75;
// const ballRadius = 8;

// let dx = 2;
// let dy = 2;

// let upPressed = false;
// let downPressed = false;
// let wPressed = false;
// let sPressed = false;

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("playButton").addEventListener("click", function() {
        if (gameStarted) {
            stopGame(gameId, null);  // Arrête le jeu si déjà en cours
        }
        initializeGame().then(() => {
            startGame();
        }).catch((error) => {
            console.error("Erreur lors de l'initialisation du jeu :", error);
        });
    });

    // Pause le jeu lorsque tu changes de section via HTMX
    document.body.addEventListener("htmx:beforeSwap", function() {
        if (gameStarted) {
            pauseGame();  // Met en pause le jeu lorsqu'une nouvelle section est chargée
        }
    });

    // Bouton pour reprendre le jeu
    document.getElementById("resumeButton").addEventListener("click", function() {
        resumeGame();
    });

    // Bouton pour quitter le jeu
    document.getElementById("quitButton").addEventListener("click", function() {
        quitGame();
    });

    if (gamePaused) {
        document.getElementById("pauseMenu").style.display = "block";
        document.getElementById("playMenu").style.display = "none";
    } else {
        document.getElementById("pauseMenu").style.display = "none";
        document.getElementById("playMenu").style.display = "block";
    }

});

async function initializeGame() {
    const csrftoken = getCookie('csrftoken');

    const response = await fetch("/initialize-game/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            player1_id: null // ou un autre joueur si disponible
        })
    });

    if (!response.ok) {
        throw new Error("Erreur API : " + response.statusText);
    }

    const data = await response.json();
    console.log("Partie initialisée :", data);

    // Utilise les données retournées par l'API (ex : initialiser les scores)

    playerName = data.player1;
    // console.log(playerName);
    playerScore = data.player1_score;
    opponentScore = data.player2_score;
    arena_width = canvas.width;
    arena_height = canvas.height;

    if (data.player2_id) {
        opponentName = data.player2;
    }

    // Stocker l'ID de la partie
    gameId = data.id;
}

// Fonction pour mettre le jeu en pause
function pauseGame() {
    clearInterval(gameInterval);  // Stoppe l'intervalle pour mettre en pause le rendu
    gameStarted = false;  // Met à jour l'état du jeu
    gamePaused = true;  // Marque le jeu comme étant en pause
    document.getElementById("playMenu").style.display = "none";  // Cache le bouton "JOUER"
    document.getElementById("pauseMenu").style.display = "block";  // Affiche le menu de pause
    console.log("Le jeu est en pause.");
}


// Fonction pour reprendre le jeu
function resumeGame() {
    document.getElementById("pauseMenu").style.display = "none";  // Cache le menu de pause
    startGame();  // Redémarre le jeu
    gamePaused = false;  // Le jeu n'est plus en pause
}


// Fonction pour quitter le jeu
function quitGame() {
    document.getElementById("pauseMenu").style.display = "none";  // Cache le menu de pause
    stopGame(gameId, null);  // Arrête complètement le jeu
    console.log("Le jeu a été quitté.");
}

function startGame() {
    if (gamePaused) {
        resumeGame();  // Si le jeu était en pause, on le reprend
        return;
    }

    // Masquer le bouton "JOUER" et le menu pause
    document.getElementById("playMenu").style.display = "none";
    document.getElementById("pauseMenu").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");

    gameStarted = true;
    gamePaused = false;  // Assure-toi que le jeu n'est pas en pause au démarrage

    // let x = canvas.width / 2;
    // let y = canvas.height / 2;


    // let playerPaddleY = (canvas.height - paddleHeight) / 2;
    // let opponentPaddleY = (canvas.height - paddleHeight) / 2;
    // const playerPaddleX = 10;

    movePaddle('player1', playerPaddleY);  // Mettre à jour la position de la raquette de player1
    movePaddle('player2', opponentPaddleY);  // Mettre à jour la position de la raquette de player1

    resetBall(null, true);

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
        if(dx > 0)
            context.fillStyle = "#0095DD";
        else
            context.fillStyle = "DD0000"
        context.fill();
        context.closePath();
    }

    function drawPlayerPaddle() {
        context.beginPath();
        context.rect(10, playerPaddleY, paddleWidth, paddleHeight);  // 'player1' à gauche
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
    }
    
    function drawOpponentPaddle() {
        context.beginPath();
        context.rect(canvas.width - paddleWidth - 10, opponentPaddleY, paddleWidth, paddleHeight);  // 'player2' à droite
        context.fillStyle = "#DD0000";
        context.fill();
        context.closePath();
    }
    

    function drawScore() {
        document.getElementById('playerScore').innerText = `${playerName}: ${playerScore}`;
        document.getElementById('opponentScore').innerText = `Opponent: ${opponentScore}`;
    }

    function checkWin() {
        if (playerScore >= winningScore) {
            drawScore();
            stopGame(gameId, 'player1');
        }
        else if (opponentScore >= winningScore) {
            drawScore();
            stopGame(gameId, 'player2');
        }
    }

    let fetchingOpponentPosition = false;

    setInterval(async function() {
        if (!fetchingOpponentPosition) {
            fetchingOpponentPosition = true;
            const opponentPosition = await getPaddlePosition('player2');
            opponentPaddleY = opponentPosition;
            fetchingOpponentPosition = false;
        }
    }, 1000);

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

        if (x - ballRadius <= paddleWidth + 10) {
            const result = checkCollisionWithPaddle(x, y, ballRadius, 10, playerPaddleY, dx, dy);
            dx = result.dx;
            dy = result.dy;
        }
        // Pas de collision avec la raquette de player1 => player2 marque un point
        else if (x + ballRadius > canvas.width + 20) {
            playerScore++;
            checkWin();
            resetBall('player1');  // Réinitialiser la balle au centre
            updateScoreApi('player1');  // Envoyer le score mis à jour au backend
        }
        
        // Collision avec player2 (raquette de droite)
        if (x + ballRadius >= canvas.width - paddleWidth - 10) {
            const result = checkCollisionWithPaddle(x, y, ballRadius, canvas.width - paddleWidth - 10, opponentPaddleY, dx, dy);
            dx = result.dx;
            dy = result.dy;
        }
        // Pas de collision avec la raquette de player2 => player1 marque un point
        else if (x - ballRadius < -20) {
            opponentScore++;
            checkWin();
            resetBall('player2');  // Réinitialiser la balle au centre
            updateScoreApi('player2');  // Envoyer le score mis à jour au backend
        }

        // Contrôler player1 avec 'W' et 'S'
        if (wPressed && playerPaddleY > 0) {
            playerPaddleY -= 7;
            movePaddle('player1', playerPaddleY);  // Met à jour la position de player1 dans l'API
        } else if (sPressed && playerPaddleY < canvas.height - paddleHeight) {
            playerPaddleY += 7;
            movePaddle('player1', playerPaddleY);  // Met à jour la position de player1 dans l'API
        }

        // Contrôler player2 avec les flèches haut/bas
        if (upPressed) { // && opponentPaddleY > 0
            // opponentPaddleY -= 7; 
            movePaddle('up');  // Met à jour la position de player2 dans l'API
        } else if (downPressed) { // && opponentPaddleY < canvas.height - paddleHeight
            // opponentPaddleY += 7;
            movePaddle('down');  // Met à jour la position de player2 dans l'API
        }

        x += dx;
        y += dy;
    }

    
    function resetBall(lastScoringPlayer = null, isGameStart = false) {
        const canvas = document.getElementById("pongCanvas");
    
        // Si c'est le début du jeu, choisir aléatoirement le joueur de départ
        if (isGameStart) {
            lastScoringPlayer = Math.random() > 0.5 ? 'player1' : 'player2';
        }
    
        // Si player1 doit servir (soit début de partie, soit après un point)
        if (lastScoringPlayer === 'player1') {
            x = canvas.width - paddleWidth - 20;  // Positionner la balle près du bord droit
            dx = -2;  // La balle part vers la gauche
        } else {
            x = paddleWidth + 20;  // Positionner la balle près du bord gauche
            dx = 2;  // La balle part vers la droite
        }
    
        // Centrer la balle verticalement
        y = canvas.height / 2;
    
        // Trajectoire parfaitement droite (dy = 0)
        dy = 0;
    }
    
    

    gameInterval = setInterval(draw, 8);
}

function stopGame(gameId, winnerId) {
    clearInterval(gameInterval);  // Stoppe le jeu
    gameStarted = false;  // Met à jour l'état du jeu
    
    // Masquer les éléments du jeu
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("playButton").style.display = "block";  // Réafficher le bouton "JOUER"

    // Appel à l'API pour mettre fin à la partie
    if (gameId, winnerId)
    {
        const csrftoken = getCookie('csrftoken');  // Assurez-vous d'inclure le token CSRF si nécessaire
        fetch(`/end-game/${gameId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ winner_id: winnerId })  // Spécifier le gagnant
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la fin de la partie');
            }
            return response.json();
        })
        .then(data => {
            console.log('Partie terminée avec succès :', data);
            alert(`Le jeu est terminé ! Le gagnant est ${data.winner ? data.winner.username : 'aucun gagnant spécifié'}`);
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Impossible de terminer la partie.');
        });
    }
}

async function updateScoreApi(player) {
    const csrftoken = getCookie('csrftoken');
    
    const response = await fetch("/update-score/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            game_id: gameId,  // Utilisation de l'ID de la partie en cours
            player: player
        })
    });

    if (!response.ok) {
        console.error("Erreur lors de la mise à jour du score :", response.statusText);
    }
    else
        console.log("Score mis à jour avec succès");
}

// Fonction pour récupérer le token CSRF depuis le cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Le cookie CSRF commence par "name="
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function movePaddle(player, direction) {
    const csrftoken = getCookie('csrftoken');
    
    const response = await fetch("/move-paddle/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            game_id: gameId,  // Utilisation de l'ID de la partie en cours
            player: player,   // 'player2' ou 'player1'
            direction: direction
        })
    });

    if (!response.ok) {
        console.error("Erreur lors du déplacement de la raquette :", response.statusText);
    } else {
        console.log(`Raquette déplacée pour ${player} à la position ${newPosition}`);
    }
}

async function getPaddlePosition(player) {
    const response = await fetch(`/get-paddle-position/${gameId}/${player}/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        console.error("Erreur lors de la récupération de la position :", response.statusText);
    } else {
        const data = await response.json();
        return data.position;
    }
}

function checkCollisionWithPaddle(ballX, ballY, ballRadius, paddleX, paddleY, dx, dy) {
    // Vérifier si la balle touche la raquette (en fonction de la position horizontale et verticale)
    if (ballX - ballRadius <= paddleX + paddleWidth && ballX + ballRadius >= paddleX) {
        if (ballY + ballRadius >= paddleY && ballY - ballRadius <= paddleY + paddleHeight) {
            // Calcul de l'impact de la balle sur la raquette
            let relativeIntersectY = (paddleY + (paddleHeight / 2)) - ballY;
            let normalizedRelativeY = relativeIntersectY / (paddleHeight / 2);
            let bounceAngle = normalizedRelativeY * Math.PI / 6;  // Limiter l'angle de rebond à +/- 30 degrés

            // Inversion de la direction horizontale de la balle
            dx = -dx;
            
            // Ajuster la direction verticale en fonction de l'angle de rebond
            dy = dy + Math.sin(bounceAngle) * Math.abs(dx);

            // Augmenter légèrement la vitesse après chaque collision
            dx *= 1.01;
            dy *= 1.01;

            return { dx, dy };  // Retourner les nouvelles valeurs de direction
        }
    }
    
    return { dx, dy };  // Si pas de collision, retourner les valeurs de direction inchangées
}




