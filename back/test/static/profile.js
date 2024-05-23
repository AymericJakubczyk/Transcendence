function profileView() {

	const pseudo = JSON.parse(document.getElementById('pseudo').textContent);
	const first = JSON.parse(document.getElementById('first').textContent);
	const second = JSON.parse(document.getElementById('second').textContent);

	document.getElementById('page').innerHTML = `
	<div class="container">
		<h1>Profile Page</h1>
		<br>
		<h6>Pseudo :</h6>
		<p>${pseudo}</p>
		<h6>First name :</h6>
		<p>${first}</p>
		<h6>Second name :</h6>
		<p>${second}</p>
	</div>
	`;
	return '';
}