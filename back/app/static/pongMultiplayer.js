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

let playersObjs = [
    { color: 0x00f3ff, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0xff49ec, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0x581845, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0x49ff7d, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0xFF5733, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0xC70039, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0xFFC300, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { color: 0xae00ff, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
  ]; 

const ringRadius = 50;

function testMulti()
{
    myCanvas = document.getElementById("pongCanvas")

    console.log("[MULTI SIZE]", myCanvas.clientWidth, myCanvas.clientHeight)
    console.log("[MULTI SIZE]", myCanvas.scrollWidth, myCanvas.scrollHeight)
    renderer = new THREE.WebGLRenderer({canvas: myCanvas,antialias: true});
    renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight);
    camera = new THREE.PerspectiveCamera( 75, (myCanvas.clientWidth * 10) / (myCanvas.clientHeight * 10), 0.1, 1000 );


    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0x262626 );

    nbPlayers = 8;

    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 16 );
    const ballMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffee } );

    ball = new THREE.PointLight( 0x00ff00, 1, 15 );
    ball.add( new THREE.Mesh( ballGeometry, ballMaterial) );
    ball.position.x = arenaLength / 2;
    ball.position.y = arenaWidth / 2;


    const ringGeometry = new THREE.RingGeometry( ringRadius, ringRadius-0.15, 100 );
    const ringMaterial = new THREE.MeshBasicMaterial( { color: 0xdbdbdb, side: THREE.DoubleSide } );
    
    ring = new THREE.Mesh( ringGeometry, ringMaterial);
    ring.position.x = arenaLength / 2;
    ring.position.y = arenaWidth / 2;
    ring.position.z = 0.5;


    scene.add( ball );
    scene.add( ring );
    
    drawZones()
    drawPaddles()
    cam1()
    
    renderer.render( scene, camera );
}

function drawZones()
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

function drawPaddles()
{
    playerZoneSize = (2 * Math.PI) / nbPlayers;
    playerPaddleSize = ((2 * Math.PI) / nbPlayers) / 4;
    paddleRadius = ringRadius-2
    for (let i = 0; i < nbPlayers; i++)
    {
        playerPaddleStart = playersObjs[i].zoneStart + playerPaddleSize * 1.5;
        playerPaddleColor = 0x000000;
        if (i == 0)
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
