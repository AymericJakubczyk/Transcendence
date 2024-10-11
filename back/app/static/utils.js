window.addEventListener('htmx:beforeSwap', function(evt) {
    const old_path = window.location.pathname;
    const new_path = evt.detail.pathInfo.path
    console.log('old location!', old_path);
    console.log('new location!', new_path);
    if (new_path == "/chat/" || new_path == "/logout/")
    {
        minimize_mini_chat()
        document.getElementById("mini_chat").hidden = true
    }
    else if (old_path == "/chat/")
    {
        set_global_notif()
        document.getElementById("mini_chat").hidden = false
    }
    
    if (old_path == "/game/chess/ranked/" && chessSocket)
    {
        console.log("[WS] chess socket closed")
        chessSocket.close()
        chessSocket = null
    }
    if (old_path == "/game/pong/local/")
    {
        console.log("[LOG] Stop local game")
        clearInterval(gameInterval)
        clearInterval(moveIAInterval)
        clearInterval(IAInterval)
    }
    if (old_path.startsWith("/game/pong/ranked/") && (new_path == "/game/pong/ranked/" || !new_path.startsWith("/game/pong/ranked/"))  && pongSocket)
    {
        console.log("[WS PONG] socket closed")
        pongSocket.close()
        pongSocket = null
    }
});