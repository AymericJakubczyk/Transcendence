// let upPressed = false;
// let downPressed = false;
// let wPressed = false;
// let sPressed = false;

// gameInterval = null

// var scene = undefined;
// var camera = undefined;
// var renderer = undefined;

// const arenaWidth = 100
// const arenaLength = 150
// const ballRadius = 1;
// const paddleWidth = 1;
// const paddleHeight = 17;
// const thickness = 1;

// var myCanvas;

// var nbrHit = 0;
// var ball, paddle_1, paddle_2;
// var paddle_1Light, paddle_2Light;

// let x = arenaLength / 2;
// let y = arenaWidth / 2;
// let baseSpeed = 0.5;
// let dx = 0.5;
// let dy = 0.5;

// let playerScore = 0;
// let opponentScore = 0;
// let ballDirection = (Math.random() > 0.5 ? 1 : -1);

// const winningScore = 5;

var ring;
var nbPlayers;
var activePlayers;
var myplayerID;

let playersObjs = [
    { alive: 1, color: 0x00f3ff, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0xff49ec, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0xC70039, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0x49ff7d, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0xFF5733, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0x581845, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0xFFC300, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 1, color: 0xae00ff, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
  ];

const ringRadius = 50;

function setup_game()
{
    // PLAYER COLOR DISPLAY
    div = document.getElementById("pongmulti_playerlist");
    for (let i = 0; i < nbPlayers; i++) {
        playerElem = document.createElement("h4");
        if (i == myplayerID)
            playerElem.textContent = "You";
        else
            playerElem.textContent = "Player " + (i + 1);
        playerElem.style.color = "#" + playersObjs[i].color.toString(16).padStart(6, '0');
        div.appendChild(playerElem);
    }

    // CANVAS SETUP 
    myCanvas = document.getElementById("pongCanvas")
    renderer = new THREE.WebGLRenderer({canvas: myCanvas,antialias: true});
    renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight);
    camera = new THREE.PerspectiveCamera( 75, (myCanvas.clientWidth * 10) / (myCanvas.clientHeight * 10), 0.1, 1000 );

    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0x262626 );

    // BALL SETUP
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 16 );
    const ballMaterial = new THREE.MeshBasicMaterial( { color: 0x12e012 } );

    ball = new THREE.PointLight( 0x12e012, 1, 15 );
    ball.add( new THREE.Mesh( ballGeometry, ballMaterial) );
    ball.position.x = arenaLength / 2;
    ball.position.y = arenaWidth / 2;
    scene.add( ball );

    // RING SETUP 
    const ringGeometry = new THREE.RingGeometry( ringRadius, ringRadius-0.15, 100 );
    const ringMaterial = new THREE.MeshBasicMaterial( { color: 0xdbdbdb, side: THREE.DoubleSide } );
    
    ring = new THREE.Mesh( ringGeometry, ringMaterial);
    ring.position.x = arenaLength / 2;
    ring.position.y = arenaWidth / 2;
    ring.position.z = 0.5;
    scene.add( ring );

    // KEY HANDLING
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    function keyDownHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp")
            upPressed = true;
        else if (e.key === "Down" || e.key === "ArrowDown")
            downPressed = true;
    }

    function keyUpHandler(e) {
        if (e.key === "Up" || e.key === "ArrowUp")
            upPressed = false;
        else if (e.key === "Down" || e.key === "ArrowDown")
            downPressed = false;
    }

    if (gameInterval)
        clearInterval(gameInterval)
    gameInterval = setInterval(function() { handle_input(myplayerID) }, 10);
}

function startMultiGame()
{
    setup_game();
    console.log("Starting a pong multi game with", nbPlayers, "players");
    setupZones();
    setupPaddles();
    cam1();



    renderer.render( scene, camera );
}

function handle_input(player)
{
    if (upPressed)
        ws_call_move("up", player)
    else if (downPressed)
        ws_call_move("down", player)
}

function ws_call_move(move, player)
{
    // =================== via WebSocket ===================
    const obj = {
        'type': 'move_paddle',
        'player': player,
        'move': move
    };
    pongMultiSocket.send(JSON.stringify(obj))
}

function updateZones()
{
    for (let i = 0; i < nbPlayers; i++)
        scene.remove( playersObjs[i].zone );

    playerZoneSize = (2 * Math.PI) / activePlayers;

    i = 0;
    y = 0;
    while (y < activePlayers)
    {
        if (playersObjs[i].alive == 1)
        {
            playerZoneStart = playerZoneSize * i;
            playersObjs[i].zoneStart = playerZoneStart;
            playerZoneColor = playersObjs[i].color;
            playerZoneThick = 1;
            geoZone = new THREE.RingGeometry( ringRadius, ringRadius-playerZoneThick, 100, 50, playerZoneStart, playerZoneSize);
            materialZone = new THREE.MeshBasicMaterial( { color: playerZoneColor, side: THREE.DoubleSide } );
            
            playersObjs[i].zone = new THREE.Mesh( geoZone, materialZone);
            playersObjs[i].zone.position.x = arenaLength / 2;
            playersObjs[i].zone.position.y = arenaWidth / 2;
            playersObjs[i].zone.position.z = 1;
            
            scene.add( playersObjs[i].zone );
            y++;
        }
        i++;
    }
    console.log("Created", y, "zones.");
}

function setupZones()
{   
    playerZoneSize = (2 * Math.PI) / nbPlayers;
    for (let i = 0; i < nbPlayers; i++)
    {
        playerZoneStart = playerZoneSize * i;
        playersObjs[i].zoneStart = playerZoneStart;
        playerZoneColor = playersObjs[i].color;
        playerZoneThick = 1;
        geoZone = new THREE.RingGeometry( ringRadius, ringRadius-playerZoneThick, 100, 50, playerZoneStart, playerZoneSize);
        materialZone = new THREE.MeshBasicMaterial( { color: playerZoneColor, side: THREE.DoubleSide } );

        playersObjs[i].zone = new THREE.Mesh( geoZone, materialZone);
        playersObjs[i].zone.position.x = arenaLength / 2;
        playersObjs[i].zone.position.y = arenaWidth / 2;
        playersObjs[i].zone.position.z = 1;

        scene.add( playersObjs[i].zone );
    }
}

function getPaddlesColor(hexColor, factor)
{
    let red = (hexColor >> 16) & 0xff;
    let green = (hexColor >> 8) & 0xff;
    let blue = hexColor & 0xff;

    red = Math.floor(red * factor);
    green = Math.floor(green * factor);
    blue = Math.floor(blue * factor);

    return (red << 16) | (green << 8) | blue;
}

function setupPaddles()
{
    playerZoneSize = (2 * Math.PI) / nbPlayers;
    playerPaddleSize = ((2 * Math.PI) / nbPlayers) / 4;
    paddleRadius = ringRadius-3
    for (let i = 0; i < nbPlayers; i++)
    {
        playerPaddleStart = playersObjs[i].zoneStart + playerPaddleSize * 1.5;
        playerPaddleColor = getPaddlesColor(playersObjs[i].color, 0.5);
        if (i == myplayerID)
            playerPaddleColor = 0xffffff;
        playerPaddleThick = 1.5;
        playersObjs[i].paddlePosition = playerPaddleStart;
        geoZone = new THREE.RingGeometry( paddleRadius, paddleRadius-playerPaddleThick, 100, 50, playersObjs[i].paddlePosition, playerPaddleSize);
        materialZone = new THREE.MeshBasicMaterial( { color: playerPaddleColor, side: THREE.DoubleSide } );
        
        playersObjs[i].paddle = new THREE.Mesh( geoZone, materialZone);
        playersObjs[i].paddle.position.x = arenaLength / 2;
        playersObjs[i].paddle.position.y = arenaWidth / 2;
        playersObjs[i].paddle.position.z = 3;
        
        scene.add( playersObjs[i].paddle );
    }
}

function render_paddles(paddles)
{
    for (let i = 0; i < nbPlayers; i++) {
        newGeo = new THREE.RingGeometry( paddleRadius, paddleRadius-playerPaddleThick, 100, 50, paddles[i], playerPaddleSize);
        playersObjs[i].paddle.geometry.dispose();
        playersObjs[i].paddle.geometry = newGeo;
    }
    renderer.render(scene, camera);
}
