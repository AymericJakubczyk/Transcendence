var old_path = ""
var new_path = "";

window.addEventListener('htmx:beforeSwap', function(evt) {
    old_path = window.location.pathname;
    new_path = evt.detail.pathInfo.path

    changing_path()

    old_path = new_path
});

function htmx_request(url, method, values, push_url=true)
{
    form_htmx = document.createElement("form")
    if (method == "GET")
        form_htmx.setAttribute("hx-get", url);
    else if (method == "POST")
        form_htmx.setAttribute("hx-post", url);
    else
        return
    if (push_url)
        form_htmx.setAttribute("hx-push-url", "true");
    else 
        form_htmx.setAttribute("hx-push-url", "false");
    form_htmx.setAttribute("hx-target", "#page");
    form_htmx.setAttribute("hx-swap", "innerHTML");
    form_htmx.setAttribute("hx-indicator", "#content-loader");
    form_htmx.style.display = "none";
    for (const [key, value] of Object.entries(values))
    {
        input_value = document.createElement("input");
        input_value.setAttribute("type", "hidden");
        input_value.setAttribute("name", key);
        input_value.setAttribute("value", value);
        form_htmx.append(input_value);
    }
    input_submit = document.createElement("input");
    input_submit.setAttribute("type", "submit");
    form_htmx.append(input_submit);
    htmx.process(form_htmx);
    document.getElementById("page").appendChild(form_htmx);
    input_submit.click();
}

function change_game_headbar(text, url)
{
    game_headbar = document.getElementById('game_headbar');
	game_headbar.innerHTML = text;
	game_headbar.style.textDecoration = 'none';
    game_headbar.setAttribute('hx-get', url);

    // create copy of game_head
    copy_elem = game_headbar.cloneNode(true);
    
    game_headbar.replaceWith(copy_elem);
	htmx.process(copy_elem);
}

function cancel_game(game) {
    console.log('canceling game', game);
    if (game == 'chess')
        htmx_request("/game/chess/ranked/cancel/", "GET", {})
    else if (game == 'pong')
        htmx_request("/game/pong/ranked/cancel/", "GET", {})
    else if(game == 'pong_multi')
        htmx_request("/game/pong/multiplayer/cancel/", "GET", {})
    else if (game == 'invite')
        htmx_request("/invite/cancel/", "GET", {})
    else
    {
        console.error('wrong type of game to cancel');
        return ;
    }
    change_game_headbar('Game', '/game/');
}

function warn_game_ready_message(id)
{
    if (document.getElementById("error_msg"))
        document.getElementById("error_msg").remove()

    const error_msg = document.createElement("div");
    error_msg.setAttribute("id", "warn_game_msg");
    error_msg.setAttribute("class", "rounded-1");
    error_msg.setAttribute("style", "position: fixed; display:flex; width: 100%;top: 10px;left:0px; z-index: 1000;justify-content: center;");
    error_msg.innerHTML =`
        <div class="bg-primary text-light rounded-1 shadow p-2" style="position:absolute; width:50%; text-align:center"> 
            YOUR TOURNAMENT GAME IS READY !
            <button class="btn btn-success border border border-2 border-success-subtle" onclick="invite_tournament_game(${id})">GO</button>
            <button class="btn-close text-light" style="position: absolute; right: 10px" onclick="document.getElementById('error_msg').remove()"></button>
        </div>
    `
    document.body.append(error_msg)
    setTimeout(function(){
        error_msg.animate([
            {opacity: 1},
            {opacity: 0}
        ], {
            duration: 500
        }).onfinish = () => {
            error_msg.remove()
        }
    }, 5000)
}

function login(csrf_token)
{
    if (chatSocket)
    {
        console.log("[LOGIN] already login")
        return
    }
    create_ws()
    // redifine csrf when log
    csrftoken = csrf_token
    document.body.setAttribute('hx-headers', '{"X-CSRFToken": "'+csrf_token+'"}');
    if (document.getElementById("mini_chat"))
        document.getElementById("mini_chat").hidden = false;
    set_global_notif()

    // stop login animation
    if (gameInterval) 
        clearInterval(gameInterval);
    if (paddleInterval)
        clearInterval(paddleInterval);

    // display mini_chat
    mini_chat = document.getElementById("mini_chat")
    if (mini_chat)
    {
        console.log('[DISPLAY] mini_chat')
        mini_chat.hidden = false
        minimize_mini_chat()
    }
}

function logout()
{
    console.log('[LOGOUT]')
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null;
    }
	if (document.getElementById("global_notif"))
		document.getElementById("global_notif").hidden = true;
    mini_chat = document.getElementById("mini_chat")
    if (mini_chat)
    {
        mini_chat.innerHTML = ''
        mini_chat.hidden = true
    }
}

window.addEventListener('popstate', function(event) {
    new_path = this.window.location.pathname

    changing_path()
    
    old_path = this.window.location.pathname
    htmx_request(new_path, "GET", {}, false)
});


function changing_path()
{
    clearInterval(gameInterval)
    if (old_path == "/game/pong/local/vs-player")
    {
        console.log("[LOG] Stop local game")
        clearInterval(gameInterval)
    }

    if (pongSocket && old_path.startsWith("/game/pong/ranked/") && old_path != new_path)
    {
        console.log("[WS PONG] socket closed")
        pongSocket.close()
        pongSocket = null
    }
    if (chessSocket && old_path.startsWith("/game/chess/ranked/") && old_path != new_path)
    {
        console.log("[WS CHESS] socket closed")
        chessSocket.close()
        chessSocket = null
    }
    if (pongMultiSocket && old_path.startsWith("/game/pong/multiplayer/") && old_path != new_path)
    {
        console.log("[WS PONG MULTI] socket closed")
        pongMultiSocket.close()
        pongMultiSocket = null
    }
    if (pongAISocket && old_path.startsWith("/game/pong/local/vs-ia/") && old_path != new_path)
    {
        console.log("[WS PONG AI] socket closed")
        pongAISocket.close()
        pongAISocket = null
        document.removeEventListener("keydown", keyDownHandler_ai);
        document.removeEventListener("keyup", keyUpHandler_ai);
    }

    if (old_path == "/game/pong/tournament/" && pongTournamentSocket)
    {
        pongTournamentSocket.close()
        pongTournamentSocket = null
    }
}