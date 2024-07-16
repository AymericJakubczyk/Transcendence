

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
		add_msg(message.sender, message.message)
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
				'send_to': elems.send_to.value
			};
			add_msg("you", elems.msg.value)
			chatSocket.send(JSON.stringify(message));
			elems.msg.value = ""
			return ;
		});
	}
    else
    {
        console.log("[ERROR] not find element by id")
    }
}


function add_msg(user, msg)
{
	const msg_cont = document.createElement("p");
	msg_cont.innerHTML = "From "+ user +": " + msg;
	var myDiv = document.getElementById("all_msg");
	if (myDiv)
	{
		myDiv.append(msg_cont)
	}
}