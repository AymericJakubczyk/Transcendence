function homeView() {
    document.getElementById('page').innerHTML = `
    <h1>Home Page</h1>
    <p>coucou</p>
    <input type="text"/>
    <input type="text"/>
    <input type="button" value="send" id="send"/>
    `;
    var test = document.getElementById('send');

    test.addEventListener("click", send);
    return '';
}

function send()
{
    console.log("SEND");
}