function homeView() {

    const formTemplate = document.getElementById('form-template').innerHTML;

	document.getElementById('page').innerHTML = `
    <h1>Home Page</h1>
    <p>coucou</p>
    ${formTemplate}
    `;
    return '';
}