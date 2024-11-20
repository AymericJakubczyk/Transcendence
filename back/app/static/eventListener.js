function keyDownHandler_ranked(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft")
    {
        e.preventDefault()  // prevent scrolling with arrow keys when you played
        cmd1.classList.add("pressed")
        console.log("[UP]", upPressed)
        if (upPressed == false)
        {
            console.log("[UP] send")
            send_input_move("up", true)
        }
        upPressed = true;
        console.log("[LOG]", upPressed)

    }
    else if (e.key === "ArrowDown" || e.key === "ArrowRight")
    {
        e.preventDefault()  // prevent scrolling with arrow keys when you played
        cmd2.classList.add("pressed")
        console.log("[DOWN]", downPressed)
        if (downPressed == false)
        {
            console.log("[DOWN] send")
            send_input_move("down", true)
        }
        downPressed = true;
        console.log("[LOG]", downPressed)
    }
}

function keyUpHandler_ranked(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft")
    {
        console.log("[UP] released")
        cmd1.classList.remove("pressed")
        upPressed = false;
        console.log("[LOG]", upPressed)
        send_input_move("up", false)
    }
    else if (e.key === "ArrowDown" || e.key === "ArrowRight")
    {
        console.log("[DOWN] released")
        cmd2.classList.remove("pressed")
        downPressed = false;
        console.log("[LOG]", downPressed)
        send_input_move("down", false)
    }
}

function keyDownHandler(e) {
    console.log("[LOCAL] pressed")
    e.preventDefault()  // prevent scrolling with arrow keys when you played
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
    console.log("[LOCAL] released")
    if (e.key === "Up" || e.key === "ArrowUp")
        upPressed = false;
    else if (e.key === "Down" || e.key === "ArrowDown")
        downPressed = false;
    else if (e.key === "w" || e.key === "W")
        wPressed = false;
    else if (e.key === "s" || e.key === "S")
        sPressed = false;
}