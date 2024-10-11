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

function display_mini_chat()
{
    mini_chat = document.getElementById("mini_chat")
    mini_chat.style.padding = "0px"
    document.getElementById("mini_chat").innerHTML = `
        <div style="width:25vw">
            <div id="mini_headbar" class="d-flex flex-row justify-content-between p-2 pb-0">
                <div class="d-flex">
                    <div id="discu_tab" class="d-flex align-items-center px-1 rounded-top-2" style="cursor:pointer;" onclick="display_all_discu()">
                        <h5 style="font-size:14px" class="m-0 text-white">discussions</h5>
                        <h3 class="m-0" style="cursor:pointer">💬</h3>
                    </div>
                    <div id="invite_tab" class="d-flex align-items-center px-1 rounded-top-2" style="cursor:pointer" onclick="display_all_invite()">
                        <h5 style="font-size:14px" class="m-0 text-white">invitations</h5>
                        <h3 class="m-0" style="cursor:pointer">⚔️</h3>
                    </div>
                    <div id="invite_tab" class="d-flex align-items-center px-1 rounded-top-2" style="cursor:pointer" onclick="display_all_invite()">
                        <h5 style="font-size:14px" class="m-0 text-white">request</h5>
                        <h3 class="m-0" style="cursor:pointer">🫂</h3>
                    </div>
                </div>
                <h2 class="m-0" onclick="minimize_mini_chat()" style="color:red;cursor:pointer">X</h2>
            </div>
            <div id="all_discu_mini" style="overflow-y:scroll;height:35vh;background:rgb(80,80,80)">
            </div>
        </div>
    `
    display_all_discu()
}


function display_all_invite()
{
    document.getElementById("invite_tab").style.background = "rgb(80,80,80)"
    document.getElementById("discu_tab").style.background = "transparent"
    url = "/mini_chat/"
    fetch(url, {
        method:'POST',
        headers:{
         'Content-Type':'application/json',
         'X-CSRFToken':csrftoken,
        }, 
        body:JSON.stringify({'type':'get_invites'})
    })
    .then(response => response.json())
    .then(data => {
        all_invite = data.all_invite
        console.log("[GET ALL]", all_invite, all_invite.length)
        all_discu_div = document.getElementById("all_discu_mini")
        all_discu_div.innerHTML = ''
        for (i = 0; i < all_invite.length; i++)
        {
            invite_div = document.createElement("div")
            invite_div.setAttribute("class", "rounded-2 my-1 p-1 text-white")
            
            invite_div.innerHTML = `
                <div>`+ all_invite[i].game_type +` against `+ all_invite[i].from_user +`</div>
                <div>
                    <button class="btn btn-success">Accept</button>
                    <button class="btn btn-danger">Decline</button>
                </div>

            `
            all_discu_div.append(invite_div)
        }
    });
}

function display_all_discu()
{
    document.getElementById("invite_tab").style.background = "transparent"
    document.getElementById("discu_tab").style.background = "rgb(80,80,80)"
    url = "/mini_chat/"
    fetch(url, {
        method:'POST',
        headers:{
         'Content-Type':'application/json',
         'X-CSRFToken':csrftoken,
        }, 
        body:JSON.stringify({'type':'get_all'})
    })
    .then(response => response.json())
    .then(data => {
        all_discu_div = document.getElementById("all_discu_mini")
        all_discu_div.innerHTML = ''
        for (i = 0; i < data.all_discu.length; i++)
        {
            const discu_div = document.createElement("button");
            discu_div.style = "background-color: transparent; width:100%;border-width: 0px;display:inline-flex"
            discu_div.setAttribute("id", "btn_discu_mini_" + data.all_discu[i].name_discu)
            discu_div.setAttribute("onclick", "display_mini_discu('"+data.all_discu[i].name_discu+"', "+data.all_discu[i].id+")")
            discu_div.setAttribute("class", "rounded-2 my-1 p-1 discu")
            discu_div.innerHTML =
            `
                <div id="profile_pic_mini_`+ data.all_discu[i].name_discu +`" style="position: relative;">
                    <img src="` + data.all_discu[i].profile_picture + `" class="pp" alt="Profile Picture">
                    <div id="statut_mini_`+ data.all_discu[i].name_discu +`" class="rounded-circle bg-success" style="border: 4px rgb(80,80,80) solid;position: absolute; right: -5px; bottom: -5px;width:40%;height:40%" hidden></div>
                </div>
                <div class="d-flex flex-column mx-2" style="overflow: hidden;">
                    <span style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                        `+ data.all_discu[i].name_discu +`
                    </span>
                    <span id="last_msg_mini_`+ data.all_discu[i].name_discu +`" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
                    </span>
                </div>
            `
            all_discu_div.append(discu_div)
            if (data.all_discu[i].state == "ON")
                document.getElementById("statut_mini_" + data.all_discu[i].name_discu).hidden = false

            if (data.all_discu[i].last_message_sender == data.current_username)
                document.getElementById("last_msg_mini_" + data.all_discu[i].name_discu).innerText = "vous : " + data.all_discu[i].last_message
            else
                document.getElementById("last_msg_mini_" + data.all_discu[i].name_discu).innerText = data.all_discu[i].last_message
            
            if (data.all_discu[i].last_message_is_readed == false && data.all_discu[i].last_message_sender != data.current_username)
            {
                const notif = document.createElement("div");
                notif.setAttribute('id', 'notif_mini_' + data.all_discu[i].name_discu);
                notif.setAttribute('class', 'bg-danger text-light');
                notif.setAttribute('style', 'clip-path: ellipse(50% 50%);background-color:red;width:20px;height:20px;position: absolute; left: 0;top: 0;');
                notif.innerHTML = "!";
                document.getElementById("profile_pic_mini_" + data.all_discu[i].name_discu).append(notif);
            }
        }
     });
}

function minimize_mini_chat()
{
    document.getElementById("mini_chat").innerHTML = `
        <h2 class="m-0 p-2" style="cursor:pointer" onclick="display_mini_chat()">💬</h2>
    `
    set_global_notif()
}

function display_mini_discu(name, id)
{

    document.getElementById("mini_chat").innerHTML = `
        <div style="width:25vw">
            <div id="mini_headbar" class="d-flex flex-row justify-content-between p-2 pb-0">
                <h2 class="m-0 text-white" style="cursor: pointer;" onclick="display_mini_chat()"><-</h2>
                <form id="test_form" hx-post="/chat/" hx-push-url="true" hx-target="#page" hx-swap="innerHTML" hx-indicator="#content-loader">
                    <input type="hidden" name="change_discussion" value="`+ id +`"/>
                    <input id="mini_interlocutor" style="background-color: transparent; border-width: 0px;" type="submit" value="`+ name +`">
                </form>
                <h2 class="m-0" onclick="minimize_mini_chat()" style="color:red;cursor:pointer">X</h2>
            </div>
            <div id="discu_mini_`+ name +`" data-id="`+ id +`" class="d-flex flex-column px-2" style="height:35vh; position: relative;">
                <div id="all_msg_mini_`+ name +`" class="d-flex flex-column rounded" style="overflow-y:scroll; background-color: darkgray;height:100%;">
                </div>
                <form id="mini_send_msg" class="d-flex flex-row">
                    <input type="hidden" name="discu_id" value="`+ id +`"/>
                    <input type="hidden" name="send_to" value="`+ name +`"/>
                    <input class="rounded-start-3 px-2" style="flex-grow:1" type="text" name="msg" value="" autofocus="autofocus" autocomplete="off"/>
                    <input class="rounded-end-3" type="submit" value="SEND">
                </form>
            </div>
        </div>
    `

    test_form = document.getElementById("test_form")
    htmx.process(test_form)
    custom_submit("mini_send_msg")

    url = "/mini_chat/"
    fetch(url, {
        method:'POST',
        headers:{
         'Content-Type':'application/json',
         'X-CSRFToken':csrftoken,
        }, 
        body:JSON.stringify({'type':'get_discu', 'id':id})
    })
    .then(response => response.json())
    .then(data => {
        // set_global_notif()
        all_discu = document.getElementById("all_msg_mini_" + name)
        all_discu.innerHTML = ''
        for (i = 0; i < data.all_message.length; i++)
        {
            if (data.current_username == data.all_message[i].sender)
            {
                let messageDiv = document.createElement('div');
                messageDiv.className = "my_msg rounded-2 shadow";
                messageDiv.innerText = data.all_message[i].message;
                all_discu.appendChild(messageDiv);
            }
            else
            {
                let messageDiv = document.createElement('div');
                messageDiv.className = "other_msg rounded-2 shadow";
                messageDiv.innerText = data.all_message[i].message;
                all_discu.appendChild(messageDiv);
            }
        }
        all_discu.scrollTop = all_discu.scrollHeight;
     });
}

function set_global_notif()
{
    const notif = document.createElement("div");
    notif.setAttribute('id', 'mini_global_notif');
    notif.setAttribute('class', 'bg-danger text-light rounded-circle');
    notif.setAttribute('style', 'clip-path: ellipse(50% 50%);width:20px;height:20px;position: absolute; left: 5px;top: 5px;text-align: center;');
    notif.innerHTML = "!";

    url = "/mini_chat/"
    fetch(url, {
        method:'POST',
        headers:{
         'Content-Type':'application/json',
         'X-CSRFToken':csrftoken,
        }, 
        body:JSON.stringify({'type':'get_global_notif'})
    })
    .then(response => response.json())
    .then(data => {
        if (data.notif == true) //add global notif
        {
            if (document.getElementById("mini_chat") && !document.getElementById("mini_global_notif") && !document.getElementById("mini_headbar"))
                document.getElementById("mini_chat").append(notif);
            cpy_notif = notif.cloneNode(true)
            cpy_notif.setAttribute('id', 'global_notif');
            cpy_notif.setAttribute('style', 'clip-path: ellipse(50% 50%);width:20px;height:20px;position: absolute; left: -10px;top: -10px;text-align: center;');
            if (document.getElementById("chat_headbar") && !document.getElementById("global_notif"))
                document.getElementById("chat_headbar").append(cpy_notif);
        }
        else if (data.notif == false) //remove global notif
        {
            if (document.getElementById("global_notif"))
                document.getElementById("global_notif").remove()
            if (document.getElementById("mini_global_notif"))
                document.getElementById("mini_global_notif").remove()
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
            nbr_message = div_all_msg.children.length
            if (div_all_msg.children[0].id == "no_more_message")
                return
            //do little animation of loading
            let loader = document.createElement('div');
            loader.className = "loader align-self-center";
            div_all_msg.prepend(loader);
            await new Promise(r => setTimeout(r, 500)); // wait 0.5s for loader to be displayed same if request is fast

            url = "/chat/"
            fetch(url, {
                method:'GET',
                headers:{
                'Content-Type':'application/json',
                'X-CSRFToken':csrftoken,
                'type':'more_message',
                'nbrMessage':nbr_message,
                'id':id
                }
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

// FOR TESTING DELETE LATER
function make_discu(send_to, id)
{
    for (i = 0; i < 100; i++)
    {
        const obj = {
            'message': i.toString(),
            'send_to': send_to,
            'discu_id': id
        };
        chatSocket.send(JSON.stringify(obj));
    }
}

function invite(opponent)
{
    invite_div = document.getElementById("invite")
    invite_div.innerHTML = ""
    invite_div.setAttribute("class", "bg-transparent rounded")
    invite_div.style.cursor = "initial"

    pong_div = document.createElement("div")
    pong_div.setAttribute("style", "cursor:pointer; background: grey")
    pong_div.setAttribute("class", "rounded p-1 m-1")
    pong_div.setAttribute("onclick", "send_invite('"+opponent+"', 'pong')")
    pong_div.innerHTML = "🏓PONG"

    chess_div = document.createElement("div")
    chess_div.setAttribute("style", "cursor:pointer; background: grey")
    chess_div.setAttribute("class", "rounded p-1 m-1")
    chess_div.setAttribute("onclick", "send_invite('"+opponent+"', 'chess')")
    chess_div.innerHTML = "♟️CHESS"

    invite_div.append(pong_div)
    invite_div.append(chess_div)
}

function send_invite(opponent, game)
{
    htmx_request("/invite/", "POST", {"opponent":opponent, "game":game})
}