function display_mini_chat()
{
    mini_chat = document.getElementById("mini_chat")
    mini_chat.style.padding = "0px"
    document.getElementById("mini_chat").innerHTML = `
        <div style="min-width:25vw">
            <div id="mini_headbar" class="d-flex flex-row justify-content-between p-2 pb-0">
                <div class="d-flex">
                    <div id="discu_tab" class="d-flex align-items-center px-1 rounded-top-2" style="cursor:pointer;" onclick="display_all_discu()">
                        <text style="font-size:1rem" class="m-0 text-white d-none d-lg-block">Discussions</text>
                        <h3 class="m-0" style="cursor:pointer">💬</h3>
                    </div>
                    <div id="invite_tab" class="d-flex align-items-center px-1 rounded-top-2" style="cursor:pointer" onclick="display_all_invite()">
                        <text style="font-size:1rem" class="m-0 text-white d-none d-lg-block">Invitations</text>
                        <h3 class="m-0" style="cursor:pointer">⚔️</h3>
                    </div>
                    <div id="friend_req_tab" class="d-flex align-items-center px-1 rounded-top-2" style="cursor:pointer" onclick="display_friend_request()">
                        <text style="font-size:1rem" class="m-0 text-white d-none d-lg-block">Request</text>
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

function minimize_mini_chat()
{
    document.getElementById("mini_chat").innerHTML = `
        <h2 class="m-0 p-2" style="cursor:pointer" onclick="display_mini_chat()">💬</h2>
    `
    set_global_notif()
}

function display_all_discu()
{
    document.getElementById("discu_tab").style.background = "rgb(80,80,80)"
    document.getElementById("invite_tab").style.background = "transparent"
    document.getElementById("friend_req_tab").style.background = "transparent"

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

function display_all_invite()
{
    document.getElementById("discu_tab").style.background = "transparent"
    document.getElementById("invite_tab").style.background = "rgb(80,80,80)"
    document.getElementById("friend_req_tab").style.background = "transparent"

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
                    <button class="btn btn-success" onclick="accept_invite(`+ all_invite[i].id +`)">Accept</button>
                    <button class="btn btn-danger">Decline</button>
                </div>

            `
            all_discu_div.append(invite_div)
        }
    });
}

function display_friend_request()
{
    document.getElementById("discu_tab").style.background = "transparent"
    document.getElementById("invite_tab").style.background = "transparent"
    document.getElementById("friend_req_tab").style.background = "rgb(80,80,80)"
    url = "/mini_chat/"
    fetch(url, {
        method:'POST',
        headers:{
         'Content-Type':'application/json',
         'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify({'type':'get_friend_request'})
    })
    .then(response => response.json())
    .then(data => {
        all_request = data.all_request
        console.log("[GET ALL]", all_request, all_request.length)
        all_discu_div = document.getElementById("all_discu_mini")
        all_discu_div.innerHTML = ''
        for (i = 0; i < all_request.length; i++)
        {
            request_div = document.createElement("div")
            request_div.setAttribute("class", "rounded-2 my-1 p-1 text-white")
            
            request_div.innerHTML = `
                <div>`+ all_request[i].from_user +` send you a friend request</div>
                <div>
                    <button class="btn btn-success">Accept</button>
                    <button class="btn btn-danger">Decline</button>
                </div>

            `
            all_discu_div.append(request_div)
        }
    });
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

function accept_invite(id)
{
    minimize_mini_chat()
    console.log("[ACCEPT]", id)
    htmx_request("/invite/", "POST", {"type":"accept" , "id":id})
}


function waiting_invite()
{
    pongSocket = new WebSocket('ws://' + window.location.host + '/ws/pong/');

    pongSocket.onopen = function() {
		console.log('[WS PONG] WebSocket PONG connection established.');
	};

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        // console.log("[WS PONG] Received:", data);
        receive_pong_ws(data)
    }

    pongSocket.onclose = (event) => {
		console.log("[WS PONG] The connection has been closed successfully.");
        pongSocket = null;
	}
}
