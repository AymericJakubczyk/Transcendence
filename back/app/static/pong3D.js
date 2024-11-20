let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;

gameInterval = null

var scene = undefined;
var camera = undefined;
var renderer = undefined;
var group = undefined;

const arenaWidth = 100
const arenaLength = 150
const ballRadius = 1;
const paddleWidth = 1;
const paddleHeight = 17;
const thickness = 1;

var myCanvas;

var nbrHit = 0;
var ball, paddle_1, paddle_2;
var paddle_1Light, paddle_2Light;

let x = arenaLength / 2;
let y = arenaWidth / 2;
let baseSpeed = 0.5;
let dx = 0.5;
let dy = 0.5;

let playerScore = 0;
let opponentScore = 0;
let ballDirection = (Math.random() > 0.5 ? 1 : -1);

const winningScore = 5;

var explosion = false;
const fragmentCount = 50;
const fragments = [];

var reverse = false;

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
    
    document.removeEventListener("keydown", keyDownHandler_ranked);
    document.removeEventListener("keyup", keyUpHandler_ranked);

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    display3D()
    if (gameInterval)
        clearInterval(gameInterval)
    gameInterval = setInterval(calculBall, 10);
}


function display3D()
{
    reverse = false
    console.log("TEST3D")
    myCanvas = document.getElementById("pongCanvas")
    group = new THREE.Group();

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
    const wallBorder = new THREE.BoxGeometry(arenaLength + thickness, thickness, ballRadius * 2);
    const goalBorder = new THREE.BoxGeometry(thickness, arenaWidth, ballRadius * 2);
    const plane_geometry = new THREE.PlaneGeometry(arenaLength, arenaWidth);

    const ballMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const wallMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff} )
    const wallMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive:0xffffff, emissiveIntensity: 0.4} )
    const groundMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff} )

    // const paddleMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    const paddleMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000, emissive:0xff0000, emissiveIntensity: 0.5 } );


    //create and place all objects in scene
    ball = new THREE.PointLight( 0x00ff00, 1, 15 );
    ball.add( new THREE.Mesh( geometry, ballMaterial) );
    ball.position.x = arenaLength / 2;
    ball.position.y = arenaWidth / 2;

    // Create fragments for explosion of ball
    for (let i = 0; i < fragmentCount; i++) {
        const fragmentGeometry = new THREE.SphereGeometry(ballRadius / 3, 8, 8);
        const fragmentMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 ,emissive:0x00ff00, emissiveIntensity: 1, transparent: true, opacity: 1});
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
        group.add(fragment);
        fragments.push(fragment);
    }

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
    const plane = new THREE.Mesh( plane_geometry, groundMaterial );
    plane.position.set(arenaLength/2,arenaWidth/2,-ballRadius)

    const ambientLight = new THREE.PointLight( 0xffffff, 1, 200 );
    ambientLight.position.set(arenaLength/2,arenaWidth/2,50)

    // light for neon effect
    // const rectLight = new THREE.RectAreaLight( 0xffffff, intensity, width, height );
    const colorLightWall = 0x0000ff
    const northWallLight = new THREE.RectAreaLight( colorLightWall, 3, arenaLength - thickness, thickness);
    northWallLight.position.set( arenaLength/2, arenaWidth - 1, 2 );
    northWallLight.lookAt( arenaLength/2, arenaWidth, 0);
    const southWallLight = new THREE.RectAreaLight( colorLightWall, 3, arenaLength - thickness, thickness);
    southWallLight.position.set( arenaLength/2, 1, 2 );
    southWallLight.lookAt( arenaLength/2, 0, 0);
    const eastWallLight = new THREE.RectAreaLight( colorLightWall, 3, thickness, arenaWidth - thickness);
    eastWallLight.position.set( arenaLength - 1, arenaWidth/2, 2);
    eastWallLight.lookAt( arenaLength, arenaWidth/2, 0);
    const westWallLight = new THREE.RectAreaLight( colorLightWall, 3, thickness, arenaWidth - thickness);
    westWallLight.position.set(1, arenaWidth/2, 2);
    westWallLight.lookAt( 0, arenaWidth/2, 0);

    paddle_1Light = new THREE.RectAreaLight( 0xff0000, 5, thickness, paddleHeight + 1);
    paddle_1Light.position.set(paddle_1.position.x + 2 , paddle_1.position.y, 3);
    paddle_1Light.lookAt(paddle_1.position.x , paddle_1.position.y, 1);
    paddle_2Light = new THREE.RectAreaLight( 0xff0000, 5, thickness, paddleHeight + 1);
    paddle_2Light.position.set(paddle_2.position.x - 2 , paddle_2.position.y, 3);
    paddle_2Light.lookAt(paddle_2.position.x , paddle_2.position.y, 1);

    light_bump_effect_wall = new THREE.RectAreaLight( 0x0000ff, 0, paddleHeight, thickness);
    
    //add objects to the scene and render
    group.add( ball );
    group.add( paddle_1, paddle_2 );
    group.add( paddle_1Light, paddle_2Light, light_bump_effect_wall);
    group.add( eastBorder, westBorder, northBorder, southBorder, plane);
    group.add( northWallLight, southWallLight, eastWallLight, westWallLight );


    cam1()
    scene.add( group );

    renderer.render( scene, camera );
}

function explodeBall() {
    explosion = true;
    ball.visible = false;
    const directions = [];

    fragments.forEach((fragment) => {
        fragment.position.set(ball.position.x, ball.position.y, ball.position.z);
        // fragment.position.set(10,10,1);
        fragment.material.opacity = 1;
        // Precompute direction vectors
        const direction = new THREE.Vector3(
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            (Math.random() - 0.5)
        ).normalize().divideScalar(3)
        directions.push(direction);
    })

    const explosionDuration = 500;
    const startTime = Date.now();
    const animateExplosion = () => {
        const elapsedTime = Date.now() - startTime;
        if (light_bump_effect_wall.intensity > 0)
            light_bump_effect_wall.intensity -= 2
        if (elapsedTime < explosionDuration) {
            fragments.forEach((fragment, index) => {
                const direction = directions[index];
                fragment.position.add(direction.clone());
                
                // Fade out
                fragment.material.opacity = 1 - elapsedTime / explosionDuration;

                // Collision detection with walls
                if (fragment.position.x < 0 + thickness || fragment.position.x > arenaLength) {
                    direction.x = -direction.x;
                }
                if (fragment.position.y < 0 + thickness || fragment.position.y > arenaWidth) {
                    direction.y = -direction.y;
                }
                if (fragment.position.z < 0 ) {
                    direction.z = -direction.z;

                }
            });
        } else {
            explosion = false;
            ball.visible = true;
            clearInterval(testInterval);
        }
        renderer.render(scene, camera);
    };
    testInterval = setInterval(animateExplosion, 1000 / 60);
}

function calculBall() {
    // Gestion des collisions avec les murs
    if (y + dy > arenaWidth - thickness/2 - ballRadius || y + dy < thickness/2 + ballRadius ) {
        light_bump_effect_wall.position.set(x, y + dy * 2, 3)
        light_bump_effect_wall.intensity = 20
        console.log("[WALL]")
        dy = -dy;
    }

    // Gestion des collisions avec les paddles
    if (x > arenaLength - thickness * 2) {
        if (y > paddle_2.position.y - paddleHeight / 2 && y < paddle_2.position.y + paddleHeight / 2) {
            paddle_2Light.intensity = 50
            nbrHit++
            dx = -baseSpeed - (0.02 * nbrHit)
            let hitPos = y - paddle_2.position.y;
            dy = hitPos * 0.15;
        } else {
            nbrHit = 0;
            playerScore++; // Opponent marque un point
            ballDirection = -1; // Le ballon se dirige vers l'adversaire
            updateScore()
            explodeBall()
            resetBall();
        }
    }

    if (x < thickness * 2) {
        if (y > paddle_1.position.y - paddleHeight / 2 && y < paddle_1.position.y + paddleHeight / 2) {
            paddle_1Light.intensity = 50
            nbrHit++
            dx = baseSpeed + (0.02 * nbrHit)
            let hitPos = y - paddle_1.position.y;
            dy = hitPos * 0.15;
        } else {
            nbrHit = 0;
            opponentScore++; // Player marque un point
            ballDirection = 1; // Le ballon se dirige vers le joueur
            updateScore()
            explodeBall()
            resetBall();
        }
    }

    if (!explosion)
    {
        x += dx;
        y += dy;
        ball.position.x = x;
        ball.position.y = y;
    }

    // Mouvement des paddles
    if (wPressed && paddle_1.position.y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2)
        paddle_1.position.y += 0.6;
    if (sPressed && paddle_1.position.y - 0.6 > thickness / 2 + paddleHeight / 2)
        paddle_1.position.y -= 0.6;

    if (upPressed && paddle_2.position.y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2)
        paddle_2.position.y += 0.6;
    if (downPressed && paddle_2.position.y - 0.6 > thickness / 2 + paddleHeight / 2)
        paddle_2.position.y -= 0.6;

    if (paddle_1Light.position.y != paddle_1.position.y)
        paddle_1Light.position.y = paddle_1.position.y
    if (paddle_2Light.position.y != paddle_2.position.y)
        paddle_2Light.position.y = paddle_2.position.y

    renderer.render( scene, camera );
    if (paddle_1Light.intensity > 5)
        paddle_1Light.intensity -= 5
    if (paddle_2Light.intensity > 5)
        paddle_2Light.intensity -= 5
    if (light_bump_effect_wall.intensity > 0)
        light_bump_effect_wall.intensity -= 2
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
    if (ball)
    {
        ball.position.x = x;
        ball.position.y = y;
    }
    dx = ballDirection * baseSpeed;
    dy = Math.random() - 0.5

}

function updateScore() {
    if (document.getElementById('playerScore') && document.getElementById('opponentScore'))
    {
        document.getElementById('playerScore').innerText = 'Player1: ' + playerScore;
        document.getElementById('opponentScore').innerText = opponentScore + ': Player2 ';
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
    gameStarted = false; // Réinitialiser l'état du jeu
    document.getElementById("playButton").style.display = "block"; // Réafficher le bouton "JOUER"
    document.getElementById("gameContainer").style.display = "none"; // Masquer le canevas du jeu
}

function cam1()
{
    // change controls style
    let cam1 = document.getElementById("cam1")
    let cam2 = document.getElementById("cam2")
    if (cam1 && cam2 && !cam1.classList.contains("pressed"))
    {
        cam1.classList.add("pressed");
        cam2.classList.remove("pressed");

        let div_controls = document.getElementById("div-controls")
        div_controls.style.flexDirection = "column"
        let cmd1 = document.getElementById("cmd1")
        let cmd2 = document.getElementById("cmd2")
        cmd1.innerHTML = "🠕"
        cmd2.innerHTML = "🠗"
    }

    // change camera position
    camera.position.z = arenaLength / 2
    camera.position.y = arenaWidth / 2;
    camera.position.x = arenaLength / 2; 
    camera.up.set(0,0,0);
    camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
    if (reverse)
        camera.rotation.z = Math.PI;
    renderer.render( scene, camera );
}

function cam2()
{
    // change controls style
    let cam1 = document.getElementById("cam1")
    let cam2 = document.getElementById("cam2")
    if (cam1 && cam2 && !cam2.classList.contains("pressed"))
    {
        cam1.classList.remove("pressed");
        cam2.classList.add("pressed");

        let div_controls = document.getElementById("div-controls")
        div_controls.style.flexDirection = "row"
        let cmd1 = document.getElementById("cmd1")
        let cmd2 = document.getElementById("cmd2")
        cmd1.innerHTML = "⭠"
        cmd2.innerHTML = "⭢"
    }

    // change camera position
    camera.position.z = 30;
    camera.position.x = -(arenaWidth / 3);
    camera.position.y = arenaWidth / 2;
    camera.up.set(1,0,0)
    camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
    if (reverse)
    {
        camera.position.x = arenaLength + arenaWidth / 3;
        camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
        camera.rotation.z = Math.PI / 2;
    }
    console.log("pos", ball.position)
    renderer.render(scene, camera);
}

function render_ball(x, y)
{
    ball.position.x = x;
    ball.position.y = y;
    renderer.render(scene, camera);
}

function reverse_cam()
{
    reverse = true
    cam1()
}