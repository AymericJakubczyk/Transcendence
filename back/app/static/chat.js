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
    document.getElementById("mini_chat").innerHTML = `
        <div style="width:25vw">
            <div id="mini_headbar" class="d-flex flex-row justify-content-between p-2">
                <h2 class="m-0 text-white">Discussions</h2>
                <h2 class="m-0" onclick="minimize_mini_chat()" style="color:red;cursor:pointer">X</h2>
            </div>
            <div id="all_discu_mini" style="overflow-y:scroll;height:35vh;">
            </div>
        </div>
    `

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
        all_discu = document.getElementById("all_discu_mini")
        all_discu.innerHTML = ''
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
                    <div id="statut_mini_`+ data.all_discu[i].name_discu +`" class="rounded-circle" style="background-color: green; border: 4px rgb(61,61,61) solid;position: absolute; right: -5px; bottom: -5px;width:40%;height:40%" hidden></div>
                </div>
                <div class="d-flex flex-column mx-2" style="overflow: hidden;">
                    <span style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                        `+ data.all_discu[i].name_discu +`
                    </span>
                    <span id="last_msg_mini_`+ data.all_discu[i].name_discu +`" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
                    </span>
                </div>
            `
            all_discu.append(discu_div)
            if (data.all_discu[i].state == "ON")
                document.getElementById("statut_mini_" + data.all_discu[i].name_discu).hidden = false

            if (data.all_discu[i].last_message_sender == data.current_username)
                document.getElementById("last_msg_mini_" + data.all_discu[i].name_discu).innerHTML = "vous : " + data.all_discu[i].last_message
            else
                document.getElementById("last_msg_mini_" + data.all_discu[i].name_discu).innerHTML = data.all_discu[i].last_message
            
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
            <div id="mini_headbar" class="d-flex flex-row justify-content-between p-2">
                <h2 class="m-0 text-white" style="cursor: pointer;" onclick="display_mini_chat()"><-</h2>
                <form id="test_form" hx-post="/chat/" hx-push-url="true" hx-target="#page" hx-swap="innerHTML" hx-indicator="#content-loader">
                    <input type="hidden" name="change_discussion" value="`+ id +`"/>
                    <input id="mini_interlocutor" style="background-color: transparent; border-width: 0px;" type="submit" value="`+ name +`">
                </form>
                <h2 class="m-0" onclick="minimize_mini_chat()" style="color:red;cursor:pointer">X</h2>
            </div>
            <div id="discu_mini_`+ name +`" data-id="`+ id +`" class="d-flex flex-column" style="overflow-y:scroll;height:35vh; position: relative;">
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
                all_discu.innerHTML += '<div class="my_msg rounded-2 shadow">'+ data.all_message[i].message +'</div>'
            else
                all_discu.innerHTML += '<div class="other_msg rounded-2 shadow">'+ data.all_message[i].message +'</div>'
        }
        all_discu.scrollTop = all_discu.scrollHeight;
     });
}


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
});


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