import * as THREE from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;

var gameInterval = null

var scene = undefined;
var camera = undefined;
var renderer = undefined;

const arenaWidth = 100
const arenaLength = 150
const ballRadius = 1;
const paddleWidth = 1;
const paddleHeight = 17;
const thickness = 1;

var myCanvas;

var nbrHit = 0;
var ball, paddle_1, paddle_2;

let x = arenaLength / 2;
let y = arenaWidth / 2;
let baseSpeed = 0.5;
let dx = 0.5;
let dy = 0.5;

let playerScore = 0;
let opponentScore = 0;
let ballDirection = (Math.random() > 0.5 ? 1 : -1);

const winningScore = 5;


function startGame()
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
}
window.startGame = startGame


function display3D()
{
    console.log("TEST3D")
    myCanvas = document.getElementById("pongCanvas")

    console.log("[SIZE]", myCanvas.clientWidth, myCanvas.clientHeight)
    console.log("[SIZE]", myCanvas.scrollWidth, myCanvas.scrollHeight)
    renderer = new THREE.WebGLRenderer({canvas: myCanvas,antialias: true});
    renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight);
    camera = new THREE.PerspectiveCamera( 75, (myCanvas.clientWidth * 10) / (myCanvas.clientHeight * 10), 0.1, 1000 );

    addEventListener("keypress", (event) => {
        if (event.key == '1')
            cam1()
        if (event.key == '2')
            cam2()  
    });
    
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0x323232 );


    //define all objects and materials
    const geometry = new THREE.SphereGeometry(ballRadius, 32, 16 );
    const paddle = new THREE.BoxGeometry( paddleWidth, paddleHeight, ballRadius * 2);
    const wallBorder = new THREE.BoxGeometry(arenaLength, thickness, ballRadius * 2);
    const goalBorder = new THREE.BoxGeometry(thickness, arenaWidth, ballRadius * 2);
    const plane_geometry = new THREE.PlaneGeometry(arenaLength, arenaWidth);

    const ballMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const wallMaterial = new THREE.MeshPhongMaterial( { color: 0x999999} )
    const paddleMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

    //create and place all objects in scene
    ball = new THREE.PointLight( 0x00ff00, 10, 20 );
    ball.add( new THREE.Mesh( geometry, ballMaterial) );

    paddle_1 = new THREE.Mesh( paddle, paddleMaterial );
    paddle_1.position.x =  paddleWidth;
    paddle_1.position.y = arenaWidth / 2;

    paddle_2 = new THREE.Mesh( paddle, paddleMaterial );
    paddle_2.position.x = arenaLength - paddleWidth;
    paddle_2.position.y = arenaWidth / 2;


    const westBorder = new THREE.Mesh( goalBorder, wallMaterial);
    westBorder.position.x = 0;
    westBorder.position.y = arenaWidth / 2;
    const eastBorder = new THREE.Mesh( goalBorder, wallMaterial);
    eastBorder.position.x = arenaLength;
    eastBorder.position.y = arenaWidth / 2;
    const northBorder = new THREE.Mesh( wallBorder, wallMaterial);
    northBorder.position.y = arenaWidth;
    northBorder.position.x = arenaLength / 2;
    const southBorder = new THREE.Mesh( wallBorder, wallMaterial);
    southBorder.position.y = 0;
    southBorder.position.x = arenaLength / 2;
    const plane = new THREE.Mesh( plane_geometry, wallMaterial );
    plane.position.set(arenaLength/2,arenaWidth/2,-ballRadius)

    const ambientLight = new THREE.AmbientLight(0x111111)
    const spotLight = new THREE.PointLight( 0x999999, 1, 200 );
    spotLight.position.set(arenaLength/2,arenaWidth/2,10)
    
    //add objects to the scene and render
    scene.add( ball );
    scene.add( paddle_1, paddle_2 );
    scene.add( eastBorder, westBorder, northBorder, southBorder, plane);
    scene.add(ambientLight)
    // scene.add(spotLight)

    cam1()

    renderer.render( scene, camera );
    if (gameInterval)
        clearInterval(gameInterval)
    gameInterval = setInterval(calculBall, 10);
}

function calculBall() {
    // drawScore();  // Affichez le score en direct

    // Gestion des collisions avec les murs
    if (y + dy > arenaWidth - thickness/2 - ballRadius || y + dy < thickness/2 + ballRadius ) {
        console.log("[WALL]")
        dy = -dy;
    }

    // Gestion des collisions avec les paddles
    if (x > arenaLength - thickness * 2) {
        if (y > paddle_2.position.y - paddleHeight / 2 && y < paddle_2.position.y + paddleHeight / 2) {
            nbrHit++
            dx = -baseSpeed - (0.02 * nbrHit)
            let hitPos = y - paddle_2.position.y;
            dy = hitPos * 0.15;
        } else {
            nbrHit = 0;
            playerScore++; // Opponent marque un point
            ballDirection = -1; // Le ballon se dirige vers l'adversaire
            updateScore()
            resetBall();
        }
    }

    if (x < thickness * 2) {
        if (y > paddle_1.position.y - paddleHeight / 2 && y < paddle_1.position.y + paddleHeight / 2) {
            nbrHit++
            dx = baseSpeed + (0.02 * nbrHit)
            let hitPos = y - paddle_1.position.y;
            dy = hitPos * 0.15;
        } else {
            nbrHit = 0;
            opponentScore++; // Player marque un point
            ballDirection = 1; // Le ballon se dirige vers le joueur
            updateScore()
            resetBall();
        }
    }

    x += dx;
    y += dy;
    ball.position.x = x;
    ball.position.y = y;

    // Mouvement des paddles
    if (wPressed && paddle_1.position.y < arenaWidth - thickness / 2 - paddleHeight / 2)
        paddle_1.position.y += 0.6;
    if (sPressed && paddle_1.position.y > thickness / 2 + paddleHeight / 2)
        paddle_1.position.y -= 0.6;

    if (upPressed && paddle_2.position.y < arenaWidth - thickness / 2 - paddleHeight / 2)
        paddle_2.position.y += 0.6;
    if (downPressed && paddle_2.position.y > thickness / 2 + paddleHeight / 2)
        paddle_2.position.y -= 0.6;

    renderer.render( scene, camera );

    style_controllers()
}


function style_controllers()
{
    if (wPressed && !document.getElementById("keyw").classList.contains("pressed"))
        document.getElementById("keyw").classList.add("pressed");
    if (!wPressed && document.getElementById("keyw").classList.contains("pressed"))
        document.getElementById("keyw").classList.remove("pressed");

    if (sPressed && !document.getElementById("keys").classList.contains("pressed"))
        document.getElementById("keys").classList.add("pressed");
    if (!sPressed && document.getElementById("keys").classList.contains("pressed"))
        document.getElementById("keys").classList.remove("pressed");

    if (upPressed && !document.getElementById("keyup").classList.contains("pressed"))
        document.getElementById("keyup").classList.add("pressed");
    if (!upPressed && document.getElementById("keyup").classList.contains("pressed"))
        document.getElementById("keyup").classList.remove("pressed");

    if (downPressed && !document.getElementById("keydown").classList.contains("pressed"))
        document.getElementById("keydown").classList.add("pressed");
    if (!downPressed && document.getElementById("keydown").classList.contains("pressed"))
        document.getElementById("keydown").classList.remove("pressed");

}

function resetBall()
{
    x = arenaLength / 2;
    y = arenaWidth / 2;
    dx = ballDirection * baseSpeed;
    // dy = 0.5;
    dy = Math.random() - 0.5

}

function updateScore() {
    if (document.getElementById('playerScore') && document.getElementById('opponentScore'))
    {
        document.getElementById('playerScore').innerText = 'Player: ' + playerScore;
        document.getElementById('opponentScore').innerText = 'Opponent: ' + opponentScore;
    }
    if (playerScore == winningScore || opponentScore == winningScore)
        stopGame()
}

function stopGame()
{
    upPressed = false
    downPressed = false
    clearInterval(gameInterval); // Arrêter l'intervalle de jeu
    clearInterval(IAInterval)
    clearInterval(moveIAInterval)
    document.getElementById("playButton").style.display = "block"; // Réafficher le bouton "JOUER"
    document.getElementById("gameContainer").style.display = "none"; // Masquer le canevas du jeu
}

function cam1()
{
    camera.position.z = arenaLength / 2
    camera.position.y = arenaWidth / 2 - 5;
    camera.position.x = arenaLength/2; 
    camera.up.set(0,0,0);
    camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
    renderer.render( scene, camera );
}

function cam2()
{
    camera.position.z = 30;
    camera.position.x = -(arenaWidth / 3);
    camera.position.y = arenaWidth / 2;
    camera.up.set(1,0,0)
    camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
    console.log("pos", ball.position)
    renderer.render(scene, camera);
}