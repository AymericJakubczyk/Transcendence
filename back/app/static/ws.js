

var ws_created = false;

var chatSocket = null;

function create_ws()
{
	if (ws_created)
	{
		console.log("websocket already create");
		return ;
	}
	console.log("launch websocket")
	chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');
	
	chatSocket.onopen = function() {
		console.log('WebSocket connection established.');
		ws_created = true;
	};
	
	chatSocket.onmessage = function(event) {
		const message = JSON.parse(event.data);
		console.log('Received message:', message);
		if (message.type == 'chat')
		{
			add_msg(message.sender, message.message, false)
			update_last_msg(message.sender, message.message)
			msg_is_read(message.sender, message.discu)
		}
		else if (message.type == 'disconnect')
			document.getElementById("statut_" + message.sender).hidden = true;
		else if (message.type == 'connect')
			document.getElementById("statut_" + message.sender).hidden = false;
	};
	
	chatSocket.onclose = (event) => {
		console.log("The connection has been closed successfully.");
		ws_created = false;
	}

}

function close_ws()
{
	if (chatSocket != null)
		chatSocket.close();
}

function custom_submit()
{
    var myForm = document.getElementById("form_message");
	
	if (myForm)
    {
        console.log("[Custom]")
		myForm.addEventListener("submit", function (event) {
			event.preventDefault(); // Empêcher la soumission du formulaire par défaut
			let elems = event.target.elements
		
			console.log("[SEND]", elems.msg.value, elems.sender.value)
			const message = {
				'sender': elems.sender.value,
				'message': elems.msg.value,
				'send_to': elems.send_to.value,
				'discu_id': elems.discu_id.value
			};
			add_msg("you", elems.msg.value, true)
			elems.msg.value = ""
			const last_msg = document.getElementById("last_msg_" + message.send_to);
			if (last_msg)
				last_msg.innerHTML = "vous : " + message.message;
			chatSocket.send(JSON.stringify(message));
			return ;
		});
	}
    else
    {
        console.log("[ERROR] not find element by id")
    }
}

function custom_mini_submit()
{
	var myMiniForm = document.getElementById("mini_send_msg");
	
	if (myMiniForm)
    {
        console.log("[Custom] mini")
		myMiniForm.addEventListener("submit", function (event) {
			event.preventDefault(); // Empêcher la soumission du formulaire par défaut
			let elems = event.target.elements
		
			console.log("[SEND]", elems.msg.value, elems.sender.value)
			const message = {
				'sender': elems.sender.value,
				'message': elems.msg.value,
				'send_to': elems.send_to.value,
				'discu_id': elems.discu_id.value
			};
			// add_msg("you", elems.msg.value, true)
			elems.msg.value = ""
			const last_msg = document.getElementById("last_msg_" + message.send_to);
			if (last_msg)
				last_msg.innerHTML = "vous : " + message.message;
			chatSocket.send(JSON.stringify(message));
			return ;
		});
	}
    else
    {
        console.log("[ERROR] not find element by id")
    }
}


function add_msg(sender, msg, you)
{
	if (you || document.getElementById("interlocutor").innerHTML == sender)
	{
		const msg_div = document.createElement("div");
		if (you)
			msg_div.setAttribute('class', 'my_msg  rounded-2 shadow')
		else
			msg_div.setAttribute('class', 'other_msg  rounded-2 shadow')
		msg_div.innerHTML = msg;
		var myDiv = document.getElementById("div_msg");
		if (myDiv)
		{
			myDiv.append(msg_div)
		}
		myDiv.scrollTop = myDiv.scrollHeight;	
	}
}

function update_last_msg(sender, msg)
{
	const discu = document.getElementById("discu_" + sender);
	const last_msg = document.getElementById("last_msg_" + sender);
	if (discu && last_msg)
	{
		last_msg.innerHTML = msg;
		const profile_pic = document.getElementById("profile_pic_" + sender);
		if (profile_pic && !document.getElementById('notif_' + sender) && !discu.classList.contains("discu_selected"))
		{
			console.log("add notif");
			const notif = document.createElement("span");
			notif.setAttribute('id', 'notif_' + sender);
			notif.setAttribute('class', 'badge bg-danger rounded-pill');
			notif.setAttribute('style', 'position: absolute; right: 0;');
			notif.innerHTML = "!";
			profile_pic.append(notif);
			
		}
	}
}

function msg_is_read(sender)
{
	console.log("verif_is_read");

	const discu = document.getElementById("discu_" + sender);
	console.log(discu.dataset.id)
	if (discu && discu.classList.contains("discu_selected"))
		{
		console.log("msg_is_read");
		url = window.location.href // current url
		fetch(url, {
			method:'POST',
			headers:{
			 'Content-Type':'application/json',
			 'X-CSRFToken':csrftoken,
			}, 
			body:JSON.stringify({'read':discu.dataset.id}) //JavaScript object of data to POST
		})
	}
}