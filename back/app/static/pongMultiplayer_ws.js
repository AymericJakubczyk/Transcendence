pongMultiSocket = null;
countdownInterval = null;

function search_multiplayer_game()
{
    pongMultiSocket = new WebSocket('ws://' + window.location.host + '/ws/pongMultiplayer/');

    pongMultiSocket.onopen = function() {
		console.log('[WS MULTI] WebSocket MULTI connection established.');
	};

    pongMultiSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.type === 'multi_match_found')
        {
            console.log("Connected in game ", data.game_id, data.player_id);
            myplayerID = data.player_id;
            nbPlayers = data.player_nb;
            activePlayers = nbPlayers;
        }
        if (data.type === 'update_after_death')
        {
            console.log("Player", data.dead_id, "is dead");

            activePlayers = data.active_players;

            scene.remove( playersObjs[data.dead_id].paddle );
            playersObjs[data.dead_id].alive = 0;

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
            if (activePlayers > 1)
            {
                console.log("UPDATING ZONES");
                updateZones();
                renderer.render(scene, camera);
            }
            
            return;
        }
        if (data.type === 'game_update')
        {
            x = data.x;
            y = data.y;
            dx = data.dx;
            dy = data.dy;
            

            render_paddles(data.paddles);
            render_ball(x, y);
            return;
        }
        console.log("[RECEIVE MATCH FOUND]", data);
        document.getElementById("text").innerHTML = "Match found !";
        redirect = document.createElement("a")
        redirect.setAttribute("hx-get", window.location.pathname + data.game_id + "/");
        redirect.setAttribute("hx-push-url", "true");
        redirect.setAttribute("hx-target", "#page");
        redirect.setAttribute("hx-swap", "innerHTML");
        redirect.setAttribute("hx-indicator", "#content-loader");
        htmx.process(redirect);
        document.getElementById("page").appendChild(redirect);
        redirect.click();
    }

    pongMultiSocket.onclose = (event) => {
		console.log("[WS MULTI] The connection has been closed successfully.");
	}
}