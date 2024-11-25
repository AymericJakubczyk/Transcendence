function display_mini_chat()
{
    console.log("[MINI CHAT]")
    mini_chat = document.getElementById("mini_chat")
    mini_chat.style.padding = "0px"
    document.getElementById("mini_chat").innerHTML = `
        <div style="min-width:25vw">
            <div id="mini_headbar" class="d-flex flex-row justify-content-between p-2 pb-0">
                <div class="d-flex">
                    <div id="discu_tab" class="d-flex position-relative align-items-center px-1 rounded-top-2" style="cursor:pointer;" onclick="display_all_discu()">
                        <text style="font-size:1rem" class="m-0 text-white d-none d-lg-block">Discussions</text>
                        <h3 class="m-0" style="cursor:pointer">💬</h3>
                        <div id="notif_discu_tab" class="notif_tab" hidden>!</div>
                    </div>
                    <div id="invite_tab" class="d-flex position-relative align-items-center px-1 rounded-top-2" style="cursor:pointer" onclick="display_all_invite()">
                        <text style="font-size:1rem" class="m-0 text-white d-none d-lg-block">Invitations</text>
                        <h3 class="m-0" style="cursor:pointer">⚔️</h3>
                        <div id="notif_invite_tab" class="notif_tab" hidden>!</div>
                    </div>
                    <div id="friend_req_tab" class="d-flex position-relative align-items-center px-1 rounded-top-2" style="cursor:pointer" onclick="display_friend_request()">
                        <text style="font-size:1rem" class="m-0 text-white d-none d-lg-block">Request</text>
                        <h3 class="m-0" style="cursor:pointer">🫂</h3>
                        <div id="notif_request_tab" class="notif_tab" hidden>!</div>
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
        <div id="global_mini_notif" class='notif bg-danger text-light rounded-circle' style="left: 2px;top: 2px" hidden>!</div>
    `
    if (document.getElementById("global_notif").hidden == false)
        document.getElementById("global_mini_notif").hidden = false
}

function display_all_discu()
{
    document.getElementById("discu_tab").classList.add("selected_tab")
    document.getElementById("invite_tab").classList.remove("selected_tab")
    document.getElementById("friend_req_tab").classList.remove("selected_tab")

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
        console.log("[GET ALL DISCU]", data)
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
                </div>
                <div class="d-flex flex-column mx-2" style="overflow: hidden;">
                    <div class="d-flex align-items-center">
                        <span class="pe-1" style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                            `+ data.all_discu[i].name_discu +`
                        </span>
                        <div id="statut_mini_`+ data.all_discu[i].name_discu +`" class="rounded-circle" style="width:13px;height:13px; background-color:green" hidden></div>
                    </div>
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
        if (data.all_discu.length == 0)
        {
            let div = document.createElement("div")
            div.id = "no_discu"
            div.setAttribute("class", "m-1 p-1 text-white text-center")
            div.innerHTML = '<h3>No discussions</h3>'
            all_discu_div.append(div)
        }

        if (data.notif_discu == true)
            document.getElementById("notif_discu_tab").hidden = false
        if (data.notif_invite == true)
            document.getElementById("notif_invite_tab").hidden = false
        if (data.notif_request == true)
            document.getElementById("notif_request_tab").hidden = false
     });
}

function display_all_invite()
{
    document.getElementById("discu_tab").classList.remove("selected_tab")
    document.getElementById("invite_tab").classList.add("selected_tab")
    document.getElementById("friend_req_tab").classList.remove("selected_tab")

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
        console.log("[GET ALL INVITE]", data)
        //set tab notif
        document.getElementById("notif_discu_tab").hidden = !data.notif_discu
        document.getElementById("notif_invite_tab").hidden = !data.notif_invite
        document.getElementById("notif_request_tab").hidden = !data.notif_request
        all_discu_div = document.getElementById("all_discu_mini")
        all_discu_div.innerHTML = ''
        for (i = 0; i < all_invite.length; i++)
        {
            invite_div = document.createElement("div")
            invite_div.setAttribute("class", "rounded-2 m-1 p-1 text-white")
            invite_div.setAttribute("id", "invite_" + all_invite[i].id)
            
            if (all_invite[i].for_tournament)
            {
                invite_div.innerHTML = `
                <div> 🏆 Your tournament game is ready </div>
                <div>
                    <button class="btn btn-success" onclick="">GO</button>
                    <button class="btn btn-danger" onclick="">GIVE UP</button>
                </div>
                `
            }
            else
            {
                invite_div.innerHTML = `
                    <div>`+ all_invite[i].game_type +` against `+ all_invite[i].from_user +`</div>
                    <div>
                        <button class="btn btn-success" onclick="accept_invite(`+ all_invite[i].id +`)">Accept</button>
                        <button class="btn btn-danger" onclick="decline_invite(`+ all_invite[i].id +`)">Decline</button>
                    </div>
                `
            }
            htmx.process(invite_div);
            all_discu_div.append(invite_div)
        }
        if (all_invite.length == 0)
        {
            let div = document.createElement("div")
            div.id = "no_invite"
            div.setAttribute("class", "m-1 p-1 text-white text-center")
            div.innerHTML = '<h3>No invitations</h3>'
            all_discu_div.append(div)
        }
    });
}

function display_friend_request()
{
    document.getElementById("discu_tab").classList.remove("selected_tab")
    document.getElementById("invite_tab").classList.remove("selected_tab")
    document.getElementById("friend_req_tab").classList.add("selected_tab")
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
        console.log("[GET ALL REQUEST]", data)
        //set tab notif
        document.getElementById("notif_discu_tab").hidden = !data.notif_discu
        document.getElementById("notif_invite_tab").hidden = !data.notif_invite
        document.getElementById("notif_request_tab").hidden = !data.notif_request

        all_discu_div = document.getElementById("all_discu_mini")
        all_discu_div.innerHTML = ''
        for (i = 0; i < all_request.length; i++)
        {
            request_div = document.createElement("div")
            request_div.setAttribute("class", "rounded-2 my-1 p-1 text-white")
            request_div.setAttribute("id", "request_" + all_request[i].id)
            
            request_div.innerHTML = `
                <div>`+ all_request[i].from_user +` send you a friend request</div>
                <div>
                    <button class="btn btn-success" onclick="friend_request('accept', `+ all_request[i].id +`)">Accept</button>
                    <button class="btn btn-danger" onclick="friend_request('decline', `+ all_request[i].id +`)">Decline</button>
                </div>
            `
            all_discu_div.append(request_div)
        }
        if (all_request.length == 0)
        {
            let div = document.createElement("div")
            div.id = "no_request"
            div.setAttribute("class", "m-1 p-1 text-white text-center")
            div.innerHTML = '<h3>No friend request</h3>'
            all_discu_div.append(div)
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
        set_global_notif()
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

function decline_invite(id)
{
    console.log("[DECLINE]", id)
    if (document.getElementById("invite_" + id))
        document.getElementById("invite_" + id).remove()
    //if no element in the list after decline invite, display no invite and remove notif
    if (document.getElementById("all_discu_mini").children.length == 0)
    {
        let div = document.createElement("div")
        div.id = "no_invite"
        div.setAttribute("class", "m-1 p-1 text-white text-center")
        div.innerHTML = '<h3>No invitations</h3>'
        document.getElementById("all_discu_mini").append(div)
        document.getElementById("notif_invite_tab").hidden = true
    }

    let obj = {"type":"decline", "id":id}
    chatSocket.send(JSON.stringify(obj));
}

function friend_request(action, id)
{
    console.log("[FRIEND REQUEST]", action, id)
    // delete friend request from list
    if (document.getElementById("request_" + id))
        document.getElementById("request_" + id).remove()

    //if no element in the list after decline or accept friend request, display no friend request and remove notif
    if (document.getElementById("all_discu_mini").children.length == 0)
    {
        let div = document.createElement("div")
        div.id = "no_request"
        div.setAttribute("class", "m-1 p-1 text-white text-center")
        div.innerHTML = '<h3>No friend request</h3>'
        document.getElementById("all_discu_mini").append(div)
        document.getElementById("notif_request_tab").hidden = true
    }

    chatSocket.send(JSON.stringify({"type":"friend_request", "action":action , "id":id}));
}

function add_invitation(game, player, id)
{
    console.log("[ADD INVITATION]", game, player)
    all_discu_div = document.getElementById("all_discu_mini")
    invite_tab = document.getElementById("invite_tab")

    if (document.getElementById("no_invite"))
        document.getElementById("no_invite").remove()
    if (invite_tab)
        document.getElementById("notif_invite_tab").hidden = false

    //else if no invite tab but mini chat is minimized, display global notif
    if (document.getElementById("global_mini_notif"))
        document.getElementById("global_mini_notif").hidden = false

        
    if (invite_tab && invite_tab.classList.contains("selected_tab"))
    {
        invite_div = document.createElement("div")
        invite_div.setAttribute("class", "rounded-2 my-1 p-1 text-white")
        invite_div.setAttribute("id", "invite_" + id)
        
        invite_div.innerHTML = `
            <div>`+ game +` against `+ player +`</div>
            <div>
                <button class="btn btn-success" onclick="accept_invite(`+ id +`)">Accept</button>
                <button class="btn btn-danger" onclick="decline_invite(`+ id +`)">Decline</button>
            </div>
        `
        htmx.process(invite_div);
        all_discu_div.append(invite_div)
    }
}

function add_friend_request(from, id)
{
    console.log("[ADD FRIEND REQUEST]", from, id)
    all_discu_div = document.getElementById("all_discu_mini")
    friend_req_tab = document.getElementById("friend_req_tab")

    if (document.getElementById("no_request"))
        document.getElementById("no_request").remove()
    if (friend_req_tab)
        document.getElementById("notif_request_tab").hidden = false
    //else if no request tab but mini chat is minimized, display global notif
    if (document.getElementById("global_mini_notif"))
        document.getElementById("global_mini_notif").hidden = false

    if (friend_req_tab && friend_req_tab.classList.contains("selected_tab"))
    {
        request_div = document.createElement("div")
        request_div.setAttribute("class", "rounded-2 my-1 p-1 text-white")
        request_div.setAttribute("id", "request_" + id)
        
        request_div.innerHTML = `
            <div>${from} send you a friend request</div>
            <div>
                <button class="btn btn-success" onclick="friend_request('accept', ${id})">Accept</button>
                <button class="btn btn-danger" onclick="friend_request('decline', ${id})">Decline</button>
            </div>
        `
        all_discu_div.append(request_div)
    }
}
