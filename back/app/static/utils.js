window.addEventListener('htmx:beforeSwap', function(evt) {
    const old_path = window.location.pathname;
    const new_path = evt.detail.pathInfo.path
    // console.log('old location!', old_path);
    // console.log('new location!', new_path);    
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
        // clearInterval(moveIAInterval)
        clearInterval(IAInterval)
    }
    if (old_path.startsWith("/game/pong/ranked/") && (new_path == "/game/pong/ranked/" || !new_path.startsWith("/game/pong/ranked/"))  && pongSocket)
    {
        console.log("[WS PONG] socket closed")
        pongSocket.close()
        pongSocket = null
    }
    if (old_path.startsWith("/game/pong/multiplayer/") && !new_path.startsWith("/game/pong/multiplayer/"))
    {
        console.log("[WS PONG MULTI] socket closed")
        pongMultiSocket.close()
        pongMultiSocket = null
    }
    if (old_path == "/invite/" && pongSocket)
    {
        pongSocket.close()
        pongSocket = null
    }
});

function htmx_request(url, method, values)
{
    form_htmx = document.createElement("form")
    if (method == "GET")
        form_htmx.setAttribute("hx-get", url);
    else if (method == "POST")
        form_htmx.setAttribute("hx-post", url);
    else
        return
    form_htmx.setAttribute("hx-push-url", "true");
    form_htmx.setAttribute("hx-target", "#page");
    form_htmx.setAttribute("hx-swap", "innerHTML");
    form_htmx.setAttribute("hx-indicator", "#content-loader");
    for (const [key, value] of Object.entries(values))
    {
        console.log(key, value)
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
    console.log("submit")
    input_submit.click();
}