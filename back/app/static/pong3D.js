var scene = undefined;

var camera = undefined;
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const renderer = new THREE.WebGLRenderer();
var renderer = undefined;
// renderer.setAnimationLoop( animate );
// document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const arenaWidth = 100
const arenaLength = 150
const ballRadius = 1;
const paddleWidth = 1;
const paddleHeight = 15;

const geometry = new THREE.SphereGeometry(ballRadius, 32, 16 );
const raquette = new THREE.BoxGeometry( paddleWidth, paddleHeight, ballRadius * 2);
const wallBorder = new THREE.BoxGeometry(arenaLength, 1, ballRadius * 2);
const goalBorder = new THREE.BoxGeometry(1, arenaWidth, ballRadius * 2);

const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const whiteMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const material1 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
var myCanvas;


// var geometry = new THREE.BufferGeometry();
// const vertices = new Float32Array( [
// 	-1.0, -1.0,  1.0, // v0
// 	 1.0, -1.0,  1.0, // v1
// 	 1.0,  1.0,  1.0, // v2
// 	-1.0,  1.0,  1.0, // v3
// ] );

// const indices = [
// 	0, 1, 2,
// 	2, 3, 0,
// ];

// geometry.setIndex( indices );
// geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

const cube = new THREE.Mesh( geometry, material );

const raquette_1 = new THREE.Mesh( raquette, material1 );
raquette_1.position.x = (arenaLength / 2) - paddleWidth * 2;
const raquette_2 = new THREE.Mesh( raquette, material1 );
raquette_2.position.x = -(arenaLength / 2) + paddleWidth * 2;
const eastBorder = new THREE.Mesh( goalBorder, whiteMaterial);
eastBorder.position.x = -(arenaLength / 2);
const westBorder = new THREE.Mesh( goalBorder, whiteMaterial);
westBorder.position.x = arenaLength / 2;
const northBorder = new THREE.Mesh( wallBorder, whiteMaterial);
northBorder.position.y = arenaWidth / 2;
const southBorder = new THREE.Mesh( wallBorder, whiteMaterial);
southBorder.position.y = -(arenaWidth / 2);



let x = 0;
let y = 0;
let dx = 0.2;
let dy = 0.2;


let playerPaddleY = 0;
let opponentPaddleY = 0;
const opponentPaddleX = 10;


// let gameInterval;
// let gameStarted = false;
// let playerScore = 0;
// let opponentScore = 0;
// const winningScore = 5;
// let ballDirection = 1; // 1 = vers le joueur, -1 = vers l'adversaire


function display3D()
{
    document.getElementById("playButton").style.display = "none"; // Réafficher le bouton "JOUER"
    document.getElementById("gameContainer").style.display = "inline"; // Masquer le canevas du jeu
    console.log("TEST3D")
    myCanvas = document.getElementById("pongCanvas")

    playerPaddleY = (myCanvas.height - paddleHeight) / 2;
    opponentPaddleY = (myCanvas.height - paddleHeight) / 2;

    console.log("[SIZE]", myCanvas.clientWidth, myCanvas.clientHeight)
    console.log("[SIZE]", myCanvas.scrollWidth, myCanvas.scrollHeight)
    renderer = new THREE.WebGLRenderer({canvas: myCanvas});
    renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight);
    camera = new THREE.PerspectiveCamera( 75, myCanvas.clientWidth / myCanvas.clientHeight, 0.1, 1000 );
    scene = new THREE.Scene()

    scene.add( cube );
    scene.add( raquette_1, raquette_2 );
    scene.add( eastBorder, westBorder, northBorder, southBorder );

    camera.position.z = 75;
    camera.position.y = -5;
    camera.lookAt(cube.position)

    // camera.position.z = 0;
    // camera.position.x = -25;
    // camera.position.y = 5;
    // camera.lookAt(cube.position)

    renderer.render( scene, camera );
    renderer.dispose()
    gameInterval = setInterval(calculBall, 10);
}

function calculBall() {
    // drawScore();  // Affichez le score en direct

    // Gestion des collisions avec les murs
    console.log("[SIZE]", myCanvas.width, myCanvas.height)
    if (y + dy > myCanvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

    // Gestion des collisions avec les paddles
    if (x > myCanvas.width - paddleWidth - 10 - ballRadius) {
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
            // checkWin();
            // resetBall();
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
            // checkWin();
            // resetBall();
        }
    }

    // Mouvement des paddles
    // if (upPressed && playerPaddleY > 0) {
    //     playerPaddleY -= 3;
    // } else if (downPressed && playerPaddleY < myCanvas.height - paddleHeight) {
    //     playerPaddleY += 3;
    // }

    // if (wPressed && opponentPaddleY > 0) {
    //     opponentPaddleY -= 3;
    // } else if (sPressed && opponentPaddleY < myCanvas.height - paddleHeight) {
    //     opponentPaddleY += 3;
    // }

    x += dx;
    y += dy;
    cube.position.x = x;
    cube.position.y = y;
    renderer.render( scene, camera );
}

function resetBall() {
    x = myCanvas.width / 2;
    y = myCanvas.height / 2;
    dx = 2 * ballDirection; // Direction du ballon vers le joueur qui vient de prendre un but
    dy = 2 * (Math.random() > 0.5 ? 1 : -1); // Garder un mouvement vertical aléatoire
}


addEventListener("keypress", (event) => {
    console.log(event)
    if (event.key == '1')
        cam1()
    if (event.key == '2')
        cam2()
    
});

function cam1() {
    camera.position.z = 150;
    camera.position.x = 0;
    camera.position.y = 150;
    camera.lookAt(cube.position)
    
    renderer.render( scene, camera );
}

function cam2() {
    camera.position.z = 100;
    camera.position.x = -100;
    camera.position.y = 0;
    camera.lookAt(cube.position)
    // camera.rotation.y = -Math.PI/2
    // camera.rotation.x += 0.1
    // camera.updateProjectionMatrix();
    renderer.render( scene, camera );
}