var ws_created = false;
var chatSocket = null;


function custom_submit(form_id)
{
    var myForm = document.getElementById(form_id);
	
	if (myForm)
    {
		myForm.addEventListener("submit", function (event) {
			event.preventDefault(); // Empêcher la soumission du formulaire par défaut
			let elems = event.target.elements

			const obj = {
				'message': elems.msg.value,
				'send_to': elems.send_to.value,
				'discu_id': elems.discu_id.value
			};
			if (obj.message == "" || obj.message.length > 420)
			{
				error_message("Message must be between 1 and 420 characters", 2000)
				return
			}
			chatSocket.send(JSON.stringify(obj));
			elems.msg.value = "" // for clear input
		});
	}
}

function create_ws()
{
	if (ws_created)
		return ;
	console.log("create websocket")
	chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');
	
	chatSocket.onopen = function() {
		console.log('WebSocket connection established.');
		ws_created = true;
	};
	
	chatSocket.onmessage = function(event) {
		const data = JSON.parse(event.data);
		console.log('Received ws:', data);
		var statut_elem = document.getElementById("statut_" + data.sender);
		var statut_mini_elem = document.getElementById("statut_mini_" + data.sender);
		if (data.type == 'chat')
		{
			add_msg(data.sender, data.message, false, "you")
			update_discu(data.sender, data.message, data.discu_id, data.user)
			msg_is_read(data.sender, data.discu)
			update_list_discu(data.sender)
		}
		if (data.type == 'message_valid')
		{
			add_msg("you", data.message, true, data.send_to)
			const last_msg = document.getElementById("last_msg_" + data.send_to);
			if (last_msg)
				last_msg.innerText = "vous : " + data.message;
			update_list_discu(data.send_to)
		}
		if (data.type == 'disconnect')
		{
			if (statut_elem)
				statut_elem.hidden = true;
			if (statut_mini_elem)
				statut_mini_elem.hidden = true;
		}
		if (data.type == 'connect')
		{
			if (statut_elem)
				statut_elem.hidden = false;
			if (statut_mini_elem)
				statut_mini_elem.hidden = false;
		}
		if (data.type == 'error')
		{
			error_message(data.message, 2000)
			return ;
		}
	};
	
	chatSocket.onclose = (event) => {
		console.log("The connection has been closed successfully.");
		ws_created = false;
	}
}

function close_ws()
{
	if (chatSocket)
		chatSocket = chatSocket.close();
}

function add_msg(sender, msg, you, send_to)
{
	// for chat
	var myDiv = document.getElementById("all_msg_" + sender);
	if (you)
		myDiv = document.getElementById("all_msg_" + send_to);
	if (myDiv)
	{
		const msg_div = document.createElement("div");
		if (you)
			msg_div.setAttribute('class', 'my_msg  rounded-2 shadow')
		else
			msg_div.setAttribute('class', 'other_msg  rounded-2 shadow')
		msg_div.innerText = msg;
		myDiv.append(msg_div)
		globalDiv = document.getElementById("div_msg");
		globalDiv.scrollTop = globalDiv.scrollHeight;
	}

	// for mini chat
	var myMiniDiv = document.getElementById("all_msg_mini_" + sender);
	if (you)
		myMiniDiv = document.getElementById("all_msg_mini_" + send_to);
	if (myMiniDiv)
	{
		const msg_div = document.createElement("div");
		if (you)
			msg_div.setAttribute('class', 'my_msg  rounded-2 shadow')
		else
			msg_div.setAttribute('class', 'other_msg  rounded-2 shadow')
		msg_div.innerText = msg;
		myMiniDiv.append(msg_div)
		myMiniDiv.scrollTop = myMiniDiv.scrollHeight;
	}
}

function update_discu(sender, msg, discu_id, user)
{
	var discu = document.getElementById("discu_" + sender);
	var last_msg = document.getElementById("last_msg_" + sender);
	if (!discu && document.getElementById("all_discussion")) // if discu not exist create it and add it in list
	{
		console.log("create discu", user, discu_id);
		const all_discussion = document.getElementById("all_discussion");
		all_discussion.innerHTML += `
			<form id="form_discu_`+ sender +`" hx-post="/chat/" hx-push-url="true" hx-target="#page" hx-swap="innerHTML" hx-indicator="#content-loader">
				<input type="hidden" name="change_discussion" value="`+ discu_id +`">
				<button id="discu_`+ sender +`" data-id="`+ discu_id +`" value="`+ sender +`" class="rounded-2 my-1 p-2 discu" type="submit">
					<div id="profile_pic_`+ sender +`" style="position: relative;">
						<img src="`+ user.profile_picture +`" class="pp" alt="Profile Picture">
						<div id="statut_`+ sender +`" class="rounded-circle" style="background-color: green; border: 4px rgb(61,61,61) solid;position: absolute; right: -5px; bottom: -5px;width:40%;height:40%"></div>
					</div>
					<div class="d-flex flex-column mx-2" style="overflow: hidden;">
						<span style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
							`+ sender +`
						</span>
						<span id="last_msg_`+ sender +`" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
							`+ msg +`
						</span>
					</div>
				</button>
			</form>`
		htmx.process(document.getElementById("form_discu_" + sender));
	}
	discu = document.getElementById("discu_" + sender);
	last_msg = document.getElementById("last_msg_" + sender);
	if (discu && last_msg) // if discu exist update last message and notif
	{
		last_msg.innerText = msg;
		const profile_pic = document.getElementById("profile_pic_" + sender);
		if (profile_pic && !document.getElementById('notif_' + sender) && !discu.classList.contains("discu_selected"))
		{
			const notif = document.createElement("div");
			notif.setAttribute('id', 'notif_' + sender);
			notif.setAttribute('class', 'bg-danger text-light');
			notif.setAttribute('style', 'clip-path: ellipse(50% 50%);background-color:red;width:20px;height:20px;position: absolute; left: 0;top: 0;');
			notif.innerHTML = "!";
			profile_pic.append(notif);
		}
	}
	var last_msg_mini = document.getElementById("last_msg_mini_" + sender);
	if (!last_msg_mini && document.getElementById("all_discu_mini")) // if mini discu not exist create it and add it in list
	{
		document.getElementById("all_discu_mini").innerHTML += `
			<button id="btn_discu_mini_`+ sender +`" onclick="display_mini_discu('`+ sender +`', `+ discu_id +`)" class="rounded-2 my-1 p-1 discu" style="background-color: transparent; width: 100%; border-width: 0px; display: inline-flex;">
                <div id="profile_pic_mini_`+ sender +`" style="position: relative;">
                    <img src="`+ user.profile_picture +`" class="pp" alt="Profile Picture">
                    <div id="statut_mini_`+ sender +`" class="rounded-circle" style="background-color: green; border: 4px rgb(61,61,61) solid;position: absolute; right: -5px; bottom: -5px;width:40%;height:40%"></div>
                </div>
                <div class="d-flex flex-column mx-2" style="overflow: hidden;">
                    <span style="font-size: 24px; font-weight: 400;color:#ffffff; text-align: start;text-overflow: ellipsis;">
                        `+ sender +`
                    </span>
                    <span id="last_msg_mini_`+ sender +`" style="font-size: 14px; font-weight: 100; color:#c0c0c0 ;padding-left: 5px;text-align: start;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%">
						`+ msg +`
					</span>
                </div>
            </button>
		`
	}
	last_msg_mini = document.getElementById("last_msg_mini_" + sender);
	if (last_msg_mini)
	{
		last_msg_mini.innerText = msg;
		const profile_pic_mini = document.getElementById("profile_pic_mini_" + sender);
		if (profile_pic_mini && !document.getElementById('notif_mini_' + sender))
		{
			const notif = document.createElement("div");
			notif.setAttribute('id', 'notif_mini_' + sender);
			notif.setAttribute('class', 'bg-danger text-light');
			notif.setAttribute('style', 'clip-path: ellipse(50% 50%);background-color:red;width:20px;height:20px;position: absolute; left: 0;top: 0;');
			notif.innerHTML = "!";
			profile_pic_mini.append(notif);
		}
	}
}

function update_list_discu(sender)
{
	// update for chat
	const discu = document.getElementById("form_discu_" + sender);
	if (discu)
	{
		discu.remove();
		const all_discussion = document.getElementById("all_discussion");
		all_discussion.insertBefore(discu, all_discussion.children[0]);
	}

	//update for mini chat
	const discu_mini = document.getElementById("btn_discu_mini_" + sender);
	if (discu_mini)
	{
		discu_mini.remove();
		const all_discu_mini = document.getElementById("all_discu_mini");
		all_discu_mini.insertBefore(discu_mini, all_discu_mini.children[0]);
	}
}

function msg_is_read(sender)
{
	const discu = document.getElementById("discu_" + sender);
	if (discu && discu.classList.contains("discu_selected"))
		request_for_read_message(discu.dataset.id)

	const discu_mini = document.getElementById("discu_mini_" + sender);
	if (discu_mini)
		request_for_read_message(discu_mini.dataset.id)

	if (!(discu && discu.classList.contains("discu_selected")) && !(discu_mini))
		set_global_notif()
}

function request_for_read_message(discu_id)
{
	url = "/chat/"
	fetch(url, {
		method:'POST',
		headers:{
			'Content-Type':'application/json',
			'X-CSRFToken':csrftoken,
		}, 
		body:JSON.stringify({'read':discu_id})
	})
	.then(data => {
		set_global_notif()
	});
}