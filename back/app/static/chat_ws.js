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
				'type': 'message',
				'message': elems.msg.value,
				'send_to': elems.send_to.value,
				'discu_id': elems.discu_id.value
			};
			if (obj.message == "" || obj.message.length > 420)
			{
				error_message("Message must be between 1 and 420 characters", 2000)
				return
			}
			if (!chatSocket || chatSocket.readyState != WebSocket.OPEN)
				error_message("Connection with websocket lost, please refresh the page", 2000)
			if (chatSocket)
				chatSocket.send(JSON.stringify(obj));
			elems.msg.value = "" // for clear input
		});
	}
}

function create_ws()
{
	if (ws_created)
		return ;
	if (window.location.protocol == "https:")
		chatSocket = new WebSocket('wss://' + window.location.host + '/ws/chat/');
	else 
		chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

	
	chatSocket.onopen = function() {
		console.log('WebSocket connection established.');
		ws_created = true;
	};
	
	chatSocket.onmessage = function(event) {
		const data = JSON.parse(event.data);
		console.log('Received ws:', data);

		if (data.type == 'chat_message')
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
		if (data.type == 'offline' || data.type == 'online' || data.type == 'ingame')
			change_statut(data.type, data.sender)

		if (data.type == 'error' || data.type == 'error_message')
			error_message(data.message, 2000)
		if (data.type == 'invite')
			add_invitation(data.game, data.player, data.id)
			if (data.for_tournament)
				warn_game_ready_message(data.game_id)
		if (data.type == 'invite_accepted')
			if (data.game == 'pong')
				htmx_request("/game/pong/ranked/" + data.game_id + "/", "GET", {})
			else if (data.game == 'chess')
				htmx_request("/game/chess/ranked/" + data.game_id + "/", "GET", {})
		if (data.type == 'match_found')
		{
			if (data.game_type == 'pong')
				htmx_request("/game/pong/ranked/" + data.game_id + "/", "GET", {})
			else if (data.game_type == 'chess')
				htmx_request("/game/chess/ranked/" + data.game_id + "/", "GET", {})
			else if (data.game_type == 'multi')
				htmx_request("/game/pong/multiplayer/" + data.game_id + "/", "GET", {})
		}
		if (data.type == 'friend_request')
			add_friend_request(data.from_user, data.id)
	};
	
	chatSocket.onclose = (event) => {
		console.log("The connection has been closed successfully.");
		ws_created = false;
		chatSocket = null;
	}
}

function change_statut(type, sender)
{
	var statut_elem = document.getElementById("statut_" + sender);
	var statut_mini_elem = document.getElementById("statut_mini_" + sender);

	if (type == 'offline')
	{
		if (statut_elem)
			statut_elem.hidden = true;
		if (statut_mini_elem)
			statut_mini_elem.hidden = true;
	}
	if (type == 'online')
	{
		if (statut_elem)
		{
			statut_elem.hidden = false;
			statut_elem.style.backgroundColor = "green";
		}
		if (statut_mini_elem)
		{
			statut_mini_elem.hidden = false;
			statut_mini_elem.style.backgroundColor = "green";
		}
	}
	if (type == 'ingame')
	{
		if (statut_elem)
		{
			statut_elem.hidden = false;
			statut_elem.style.backgroundColor = "blue";
		}
		if (statut_mini_elem)
		{
			statut_mini_elem.hidden = false;
			statut_mini_elem.style.backgroundColor = "blue";
		}
	}
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
			<custom-discu sender="${sender}" discu_id="${discu_id}" msg="${msg}" img="${user.profile_picture}">
			</custom-discu>
		`
		htmx.process(document.getElementById("form_discu_" + sender));
		// reset discu and last_msg value after create it
		discu = document.getElementById("discu_" + sender);
		last_msg = document.getElementById("last_msg_" + sender);
	}

	if (discu && last_msg) // else if discu exist update last message and notif
	{
		last_msg.innerText = msg;
		const profile_pic = document.getElementById("profile_pic_" + sender);
		if (profile_pic && !document.getElementById('notif_' + sender) && !discu.classList.contains("discu_selected"))
		{
			const notif = document.createElement("div");
			notif.setAttribute('id', 'notif_' + sender);
			notif.setAttribute('class', 'notif bg-danger text-light');
			notif.setAttribute('style', 'left:0; top:0');
			notif.innerHTML = "!";
			profile_pic.append(notif);
		}
	}

	var last_msg_mini = document.getElementById("last_msg_mini_" + sender);
	discu_tab = document.getElementById("discu_tab");
	if (!last_msg_mini && discu_tab && discu_tab.classList.contains("selected_tab")) // if mini discu not exist create it and add it in list
	{
		if (document.getElementById("no_discu"))
			document.getElementById("no_discu").remove()
		const all_discu_mini = document.getElementById("all_discu_mini");
		all_discu_mini.innerHTML += `
			<custom-mini-discu sender="${sender}" discu_id="${discu_id}" msg="${msg}" img="${user.profile_picture}">
			</custom-mini-discu>
		`
		// reset last_msg value after create it
		last_msg_mini = document.getElementById("last_msg_mini_" + sender);
	}
	
	if (last_msg_mini) // if mini discu exist update last message and notif
	{
		last_msg_mini.innerText = msg;
		const profile_pic_mini = document.getElementById("profile_pic_mini_" + sender);
		if (profile_pic_mini && !document.getElementById('notif_mini_' + sender))
		{
			const notif = document.createElement("div");
			notif.setAttribute('id', 'notif_mini_' + sender);
			notif.setAttribute('class', 'notif bg-danger text-light');
			notif.setAttribute('style', 'left:0; top:0;');
			notif.innerHTML = "!";
			profile_pic_mini.append(notif);
		}
	}
}

function update_list_discu(sender) // reorder discu to sort by most recent message when receive or send new message
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
	{
		// add notif for discu
		// set_global_notif()
		if (document.getElementById("global_notif"))
			document.getElementById("global_notif").hidden = false
		if (document.getElementById("global_mini_notif"))
			document.getElementById("global_mini_notif").hidden = false
		if (document.getElementById("notif_discu_tab"))
			document.getElementById("notif_discu_tab").hidden = false			
		}
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