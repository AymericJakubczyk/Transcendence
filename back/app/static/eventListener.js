function keyDownHandler_ranked(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft")
    {
        e.preventDefault()  // prevent scrolling with arrow keys when you played
        cmd1.classList.add("pressed")
        if (upPressed == false)
            send_input_move("up", true)
        upPressed = true;

    }
    else if (e.key === "ArrowDown" || e.key === "ArrowRight")
    {
        e.preventDefault()  // prevent scrolling with arrow keys when you played
        cmd2.classList.add("pressed")
        if (downPressed == false)
            send_input_move("down", true)
        downPressed = true;
    }
}

function keyUpHandler_ranked(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft")
    {
        cmd1.classList.remove("pressed")
        upPressed = false;
        send_input_move("up", false)
    }
    else if (e.key === "ArrowDown" || e.key === "ArrowRight")
    {
        cmd2.classList.remove("pressed")
        downPressed = false;
        send_input_move("down", false)
    }
}

function keyDownHandler(e) {
    console.log("[LOCAL] pressed")
    if (e.key === "Up" || e.key === "ArrowUp")
    {
        e.preventDefault()   
        upPressed = true;
    }
    else if (e.key === "Down" || e.key === "ArrowDown")
    {
        e.preventDefault()
        downPressed = true;
    }   
    else if (e.key === "w" || e.key === "W")     
    {
        e.preventDefault()
        wPressed = true;
    }   
    else if (e.key === "s" || e.key === "S")
    {
        e.preventDefault()
        sPressed = true;
    }   
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

function camHandler(event) {
    if (event.key == '1')
        cam1()
    if (event.key == '2')
        cam2()  
}