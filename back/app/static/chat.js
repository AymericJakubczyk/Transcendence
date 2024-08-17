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
            <div id="headbar" class="d-flex flex-row justify-content-between p-2">
                <h2 class="m-0 text-white">Discussions</h2>
                <h2 class="m-0" onclick="undisplay_mini_chat()" style="color:red;cursor:pointer">X</h2>
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
        console.log(data);
        all_discu = document.getElementById("all_discu_mini")
        all_discu.innerHTML = ''
        for (i = 0; i < data.all_discu.length; i++)
        {
            const discu_div = document.createElement("button");
            discu_div.style = "background-color: transparent; width:100%;border-width: 0px;display:inline-flex"
            discu_div.setAttribute("onclick", "display_mini_discu('"+data.all_discu[i].name_discu+"', "+data.all_discu[i].id+", '"+data.current_username+"')")
            discu_div.setAttribute("class", "rounded-2 my-1 p-1 discu")
            discu_div.innerHTML =
            `
                <div id="profile_pic_{{discu.name_discu}}" style="position: relative;">
                    <img src="` + data.all_discu[i].profile_picture + `" class="pp" alt="Profile Picture">
                </div>
                <div class="d-flex flex-column mx-2" style="overflow: hidden;">
                    <span style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                        `+ data.all_discu[i].name_discu +`
                    </span>
                    <span id="last_msg_{{discu.name_discu}}" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
                        ` + data.all_discu[i].last_message + `
                    </span>
                </div>
            `
            all_discu.append(discu_div)

        }
     });
}

function undisplay_mini_chat()
{
    console.log("coucou discu")
    document.getElementById("mini_chat").innerHTML = `
        <h2 class="m-0 p-2" style="cursor:pointer" onclick="display_mini_chat()">💬</h2>
    `
}

function display_mini_discu(name, id, current_username)
{

    // <h2 class="m-0 text-white"  style="cursor: pointer;" onclick="test()">`+ name +`</h2>
    console.log("[TEST]", name, id, current_username)
    document.getElementById("mini_chat").innerHTML = `
        <div style="width:25vw">
            <div id="headbar" class="d-flex flex-row justify-content-between p-2">
                <h2 class="m-0 text-white" style="cursor: pointer;" onclick="display_mini_chat()"><-</h2>
                <form id="test_form" hx-post="/chat/" hx-push-url="true" hx-target="#page" hx-swap="innerHTML" hx-indicator="#content-loader">
                    <input type="hidden" name="change_discussion" value="`+ id +`"/>
                    <input id="mini_interlocutor" style="background-color: transparent; border-width: 0px;" type="submit" value="`+ name +`">
                </form>
                <h2 class="m-0" onclick="undisplay_mini_chat()" style="color:red;cursor:pointer">X</h2>
            </div>
            <div id="all_discu_mini" class="d-flex flex-column" style="overflow-y:scroll;height:35vh; position: relative;">
                <div id="all_mini_msg" class="d-flex flex-column rounded" id="div_msg" style="overflow-y:scroll; background-color: darkgray;height:100%;">
                </div>
                <form id="mini_send_msg" class="d-flex flex-row">
                    <input type="hidden" name="discu_id" value="`+ id +`"/>
                    <input type="hidden" name="send_to" value="`+ name +`"/>
                    <input type="hidden" name="sender" value="`+ current_username +`"/>
                    <input class="rounded-start-3 px-2" style="flex-grow:1" type="text" name="msg" value="" autofocus="autofocus" autocomplete="off"/>
                    <input class="rounded-end-3" type="submit" value="SEND">
                </form>
            </div>
        </div>
    `

    test_form = document.getElementById("test_form")
    htmx.process(test_form)
    custom_mini_submit()

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
        console.log("[DATA]",data);
        all_discu = document.getElementById("all_mini_msg")
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
    if (new_path == "/chat/")
        document.getElementById("mini_chat").hidden = true
    else 
        document.getElementById("mini_chat").hidden = false
});


function test()
{
    console.log("[TEST]")
    htmx.ajax('POST', '/chat/', {target:'#page', swap:'innerHTML', values: { test: "test" }})

}