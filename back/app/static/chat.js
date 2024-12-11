function display_addable_discussion()
{
    if (document.getElementById("all_addable").hidden)
    {
        document.getElementById("all_discussion").hidden = true
        document.getElementById("all_addable").hidden = false
        document.getElementById("add_btn").innerHTML = "CANCEL"
        document.getElementById("txt_discu").innerHTML = "new discussion"
    }
    else
    {
        document.getElementById("all_discussion").hidden = false
        document.getElementById("all_addable").hidden = true
        document.getElementById("add_btn").innerHTML = "ADD +"
        document.getElementById("txt_discu").innerHTML = "all discussions"
    }
}

function set_global_notif()
{
    url = "/chat/?" + new URLSearchParams({type: "get_global_notif"}).toString()
    fetch(url, {
        method:'GET',
        headers:{'Content-Type':'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.notif == true) //add global notif
        {
            if (document.getElementById("global_notif"))
                document.getElementById("global_notif").hidden = false
            if (document.getElementById("global_mini_notif"))
                document.getElementById("global_mini_notif").hidden = false
        }
        else if (data.notif == false) //remove global notif
        {
            if (document.getElementById("global_notif"))
                document.getElementById("global_notif").hidden = true
            if (document.getElementById("global_mini_notif"))
                document.getElementById("global_mini_notif").hidden = true
        }
        if (data.notif_mini_tab)
        {
            if (document.getElementById("global_mini_notif"))
                document.getElementById("global_mini_notif").hidden = false
        }
    });
}

function error_message(msg, time)
{
    if (document.getElementById("error_msg"))
        document.getElementById("error_msg").remove()

    const error_msg = document.createElement("div");
    error_msg.setAttribute("id", "error_msg");
    error_msg.setAttribute("class", "rounded-1");
    error_msg.setAttribute("style", "position: fixed; display:flex; width: 100%;top: 10px;left:0px; z-index: 1000;justify-content: center;background-color: blue;");
    error_msg.innerHTML =`
        <div  class="bg-danger text-light rounded-1 shadow p-2" style="position:absolute; width:50%; text-align:center"> 
            ERROR : `+ msg +`
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
    }, time)
}


function detect_scroll(id)
{
    page = 1;
    div_msg = document.getElementById("div_msg")
    // get child of div_msg
    div_all_msg = div_msg.children[0]


    div_msg.addEventListener('scroll', async (event) => {
        if (div_msg.scrollTop < div_msg.scrollHeight - div_msg.clientHeight * 3)
        {
            //display button to go to bottom
            if (!document.getElementById("go_to_bottom"))
            {
                const go_to_bottom = document.createElement("div");
                go_to_bottom.setAttribute("id", "go_to_bottom");
                go_to_bottom.setAttribute("class", "to_bot_btn rounded-circle d-flex justify-content-center align-items-center");
                go_to_bottom.innerHTML ="🠟"
                go_to_bottom.addEventListener('click', (event) => {
                    div_msg.scrollTo({
                        top: div_msg.scrollHeight,
                        behavior: 'smooth'
                    });
                    go_to_bottom.remove()
                }
                )
                div_msg.append(go_to_bottom)
            }
        }
        if (div_msg.scrollTop > div_msg.scrollHeight - div_msg.clientHeight - 5)
        {
            if (document.getElementById("go_to_bottom"))
                document.getElementById("go_to_bottom").remove()
        }

        if (div_msg.scrollTop == 0)
        {
            console.log("TOP")
            if (document.getElementById("loader")) // if already loading
                return;
            nbr_message = div_all_msg.children.length
            if (div_all_msg.children[0].id == "no_more_message")
                return
            //do little animation of loading
            let loader = document.createElement('div');
            loader.id = "loader";
            loader.className = "loader align-self-center";
            div_all_msg.prepend(loader);
            await new Promise(r => setTimeout(r, 500)); // wait 0.5s for loader to be displayed same if request is fast

            url = "/chat/?" + new URLSearchParams({type: "more_message", nbrMessage: nbr_message, id: id}).toString()
            fetch(url, {
                method:'GET',
                headers:{'Content-Type':'application/json'}
            })
            .then(response => response.json())
            .then(data => {
                heigthLoader = loader.offsetHeight
                loader.remove()
                if (data.more_message.length > 0)
                    div_msg.scrollTop = 5
                for (i = 0; i < data.more_message.length; i++)
                {
                    if (data.current_username == data.more_message[i].sender)
                    {
                        let messageDiv = document.createElement('div');
                        messageDiv.className = "my_msg rounded-2 shadow";
                        messageDiv.innerText = data.more_message[i].message;
                        div_all_msg.prepend(messageDiv);
                    }
                    else
                    {
                        let messageDiv = document.createElement('div');
                        messageDiv.className = "other_msg rounded-2 shadow";
                        messageDiv.innerText = data.more_message[i].message;
                        div_all_msg.prepend(messageDiv);
                    }
                }
                if (data.more_message.length < 42)
                {
                    // no more message
                    let noMoreMessage = document.createElement('div');
                    noMoreMessage.className = "align-self-center";
                    noMoreMessage.style = "font-size: 20px;";
                    noMoreMessage.innerText = "No more message";
                    noMoreMessage.id = "no_more_message";
                    div_all_msg.prepend(noMoreMessage);
                }
                div_msg.scrollTop -= (heigthLoader + 5)

            });
        }
    });
}

function invite(opponent)
{
    invite_div = document.getElementById("invite")
    invite_div.innerHTML = ""
    invite_div.setAttribute("class", "bg-transparent rounded")
    invite_div.style.cursor = "initial"

    pong_div = document.createElement("div")
    pong_div.setAttribute("class", "rounded invite_to")
    pong_div.setAttribute("onclick", "send_invite('"+opponent+"', 'pong')")
    pong_div.innerHTML = "🏓PONG"

    chess_div = document.createElement("div")
    chess_div.setAttribute("class", "rounded invite_to")
    chess_div.setAttribute("onclick", "send_invite('"+opponent+"', 'chess')")
    chess_div.innerHTML = "♟️CHESS"

    invite_div.append(pong_div)
    invite_div.append(chess_div)
}

function send_invite(opponent, game)
{
    htmx_request("/invite/", "POST", {"type":"invite", "opponent":opponent, "game":game})
}