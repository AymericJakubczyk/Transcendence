async function fetch_user(userId) {
	try {
		const response = await fetch(`/api/profile/${userId}/`);
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		const user = await response.json();
		return (user);
	} catch (error) {
		console.error('There has been a problem with your fetch operation:', error);
	}
}

async function profileView(userId) {

	console.log("Profile view called");

	const user = await fetch_user(userId)

	document.getElementById('page').innerHTML = `
	<div class="container">
		<h1>Profile Page</h1>
		<br>
		<h6>Pseudo :</h6>
		<p>${user.pseudo}</p>
		<h6>First name :</h6>
		<p>${user.first}</p>
		<h6>Second name :</h6>
		<p>${user.second}</p>
	</div>
	`;
	return '';
}

function switch_profile_stats(choice)
{
	if (choice == 'CHESS')
	{
		document.getElementById('cat_pong').classList.add("d-none")
		document.getElementById('cat_chess').classList.remove("d-none");
	}
	else if (choice == 'PONG')
	{
		document.getElementById('cat_chess').classList.add("d-none")
		document.getElementById('cat_pong').classList.remove("d-none");
	}
}