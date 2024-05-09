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
        case '/game/':
            view = gameView();
            return ;
        case '/profile/':
            view = profileView();
            break;
        default:
            homeView();
            return;
    }
    document.getElementById('page').innerHTML = view;
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