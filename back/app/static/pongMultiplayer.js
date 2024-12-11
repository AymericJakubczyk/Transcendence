pongMultiSocket = null

var ring;
var nbPlayers;
var activePlayers;
var myplayerID;

var refresh;

let playersObjs = [
    { alive: 0, color: 0x00f3ff, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0xff49ec, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0xC70039, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0x49ff7d, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0xFF5733, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0x581845, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0xFFC300, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
    { alive: 0, color: 0xae00ff, paddle: null, zone: null, zoneStart: null, paddlePosition: null},
  ];

const ringRadius = 50;

function join_multi_game(game_data)
{
    if (window.location.protocol == "https:")
        pongMultiSocket = new WebSocket('wss://' + window.location.host + `/ws/pongMultiplayer/${game_data.id}/`);
    else
		pongMultiSocket = new WebSocket('ws://' + window.location.host + `/ws/pongMultiplayer/${game_data.id}/`);

    pongMultiSocket.onopen = function() {
		console.log('[WS MULTI] WebSocket MULTI connection established.');
        refresh = true;
	};

    pongMultiSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        receive_multi_ws(data);
    }

    pongMultiSocket.onclose = (event) => {
		console.log("[WS MULTI] The connection has been closed successfully.");
        pongMultiSocket = null;
        refresh = false;
	}
}

function receive_multi_ws(data)
{
	if (data.type === 'update_after_death')
	{
		console.log("Player", data.dead_id + 1, "is dead");
		playersObjs[data.dead_id].alive = 0;

		div_id = "name-player-" + data.dead_id;
		dead_elem = document.getElementById(div_id);
		dead_elem.style.textDecoration = "line-through";
		div_id = "life-player-" + data.dead_id;
		lifeElem = document.getElementById(div_id);
		lifeElem.textContent = "O_o";
		lifeElem.style.textDecoration = "line-through";

		activePlayers = data.active_players;

		scene.remove( playersObjs[data.dead_id].paddle );

		if (activePlayers >= 1)
		{
			console.log("UPDATING ZONES");
			updateZones();
			renderer.render(scene, camera);
		}
		if (activePlayers == 1 && playersObjs[myplayerID].alive == 1)
		{
			element = document.createElement("h3");
			element.textContent = "YOU WIN";
			parent = document.getElementById("endgame_multi_win");
			parent.appendChild(element);
		}
		else if (data.dead_id == myplayerID)
		{
			element = document.createElement("h3");
			element.textContent = "YOU LOST";
			parent = document.getElementById("endgame_multi_loss");
			parent.appendChild(element);
			if (gameInterval)
			    clearInterval(gameInterval)
		}
		if (activePlayers == 1)
		{
			redirect = document.createElement("a")
			redirect.setAttribute("hx-get", "/game/pong/multiplayer/");
			redirect.setAttribute("hx-push-url", "true");
			redirect.setAttribute("hx-target", "#page");
			redirect.setAttribute("hx-swap", "innerHTML");
			redirect.setAttribute("hx-indicator", "#content-loader");
			redirect.textContent = "REMATCH";
			redirect.setAttribute("class", "tournament-list-refresh")
			htmx.process(redirect);
			parent = document.getElementById("rematch-button");
			parent.appendChild(redirect);
            change_game_headbar("Game", "/game/");
		}
		return;
	}
	if (data.type === 'game_update')
	{
		x = data.x;
		y = data.y;
		dx = data.dx;
		dy = data.dy;
		render_ball(x, y);

		activePlayers = data.active_players;

		lifes = data.lifes;
		for (let i = 0; i < nbPlayers; i++) 
		{
			if (lifes[i] > 0)
				playersObjs[i].alive = 1
			div_id = "life-player-" + i;
			lifeElem = document.getElementById(div_id);
			if (lifes[i] == 1)
			lifeElem.textContent = "X";
			if (lifes[i] == 2)
			lifeElem.textContent = "X X";
		}
		render_paddles(data.paddles);

        if (refresh)
        {
            updateZones();
            refresh = false
        }
		return;
	}
}

function setup_game()
{
    // PLAYER COLOR DISPLAY
    htmlplayerlist = document.getElementById("pongmulti_playerlist");
    for (let i = 0; i < nbPlayers; i++) {
        //DIV
        playerDiv = document.createElement("div");
        // NAME
        playerElem = document.createElement("h4");
        playerElem.setAttribute('id', 'name-player-'+i);
        if (i == myplayerID)
            playerElem.textContent = "You";
        else
        playerElem.textContent = "Player " + (i + 1);
        playerElem.style.color = "#" + playersObjs[i].color.toString(16).padStart(6, '0');
        playerDiv.appendChild(playerElem);
        // LIFE
        playerLife = document.createElement("h4");
        playerLife.setAttribute('id', 'life-player-'+i);
        playerLife.textContent = "X X";
        playerLife.style.color = "#" + playersObjs[i].color.toString(16).padStart(6, '0');
        playerLife.style.textAlign = "center";
        playerDiv.appendChild(playerLife);

        htmlplayerlist.appendChild(playerDiv);
    }

    // CANVAS SETUP 
    myCanvas = document.getElementById("pongCanvas")
    renderer = new THREE.WebGLRenderer({canvas: myCanvas,antialias: true});
    renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight);
    camera = new THREE.PerspectiveCamera( 75, (myCanvas.clientWidth * 10) / (myCanvas.clientHeight * 10), 0.1, 1000 );

    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0x323232 );

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
    document.removeEventListener("keydown", keyDownHandler_ranked);
    document.removeEventListener("keyup", keyUpHandler_ranked);

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    if (gameInterval)
        clearInterval(gameInterval)
    gameInterval = setInterval(function() { handle_input(myplayerID) }, 10);
}

function connectMultiGame(data)
{
	console.log("Connecting multi game id =", data.id);
	join_multi_game(data);

    myplayerID = data.ingameID;
    nbPlayers = data.nbPlayers;
    activePlayers = nbPlayers;
    console.log('[WS MULTI] game params set !');

	upPressed = false;
	downPressed = false;
	resetBall();

	document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);

	setup_game();
	setupZones();
	setupPaddles();
	cam1();
	renderer.render(scene, camera);
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
    if (pongMultiSocket)
        pongMultiSocket.send(JSON.stringify(obj))
}

function updateZones()
{
    for (let i = 0; i < nbPlayers; i++)
		if (playersObjs[i].zone)
        	scene.remove( playersObjs[i].zone );

    for (let i = 0; i < nbPlayers; i++)
		if (playersObjs[i].paddle && playersObjs[i].alive == 0)
        	scene.remove( playersObjs[i].paddle );

    playerZoneSize = (2 * Math.PI) / activePlayers;
    y = 0;
    nbZones = 0;
    while (y < nbPlayers)
    {
        if (playersObjs[y].alive == 1)
        {
            playerZoneStart = playerZoneSize * nbZones;
            playersObjs[y].zoneStart = playerZoneStart;
            playerZoneColor = playersObjs[y].color;
            playerZoneThick = 1;
            geoZone = new THREE.RingGeometry( ringRadius, ringRadius-playerZoneThick, 100, 50, playerZoneStart, playerZoneSize);
            materialZone = new THREE.MeshBasicMaterial( { color: playerZoneColor, side: THREE.DoubleSide } );
            
            playersObjs[y].zone = new THREE.Mesh( geoZone, materialZone);
            playersObjs[y].zone.position.x = arenaLength / 2;
            playersObjs[y].zone.position.y = arenaWidth / 2;
            playersObjs[y].zone.position.z = 1;
            
            scene.add( playersObjs[y].zone );
            nbZones++;
        }
        y++;
    }
    renderer.render(scene, camera);
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
