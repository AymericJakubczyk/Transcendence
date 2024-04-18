function homeView() {
    return '<h1>Home Page</h1>';
}

function gameView() {
    return '<h1>Game Page</h1>';
}

function chatView() {
    return '<h1>Chat Page</h1>';
}

function profileView() {
    return '<h1>Profile Page</h1>';
}

// Update handleRouteChange to render views
function handleRouteChange() {
    const path = window.location.pathname;
    let view;

    switch (path) {
        case '/game':
            view = gameView();
            break;
        case '/chat':
            view = chatView();
            break;
        case '/profile':
            view = profileView();
            break;
        default:
            view = homeView();
    }

    document.getElementById('app').innerHTML = view;
}

document.querySelectorAll('.route').forEach(link => {
    link.addEventListener('click', function(e) {
        console.log("[EVENT] click");
        e.preventDefault();
        history.pushState(null, '', this.href);
        handleRouteChange();
    });
});

window.addEventListener('popstate', handleRouteChange);

// Initialize the router
console.log("hello")
handleRouteChange();