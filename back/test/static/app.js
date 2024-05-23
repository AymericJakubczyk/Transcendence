function View404() {
	document.getElementById('page').innerHTML = `
    <div class="container justify-content-center align-items-center text-center pt-5 pb-5 mt-5 mb-5" style="background: #FF00FF">
		</br>
		</br>
		<h1>404</h1>
		<p>Sorry, the page you are looking for does not exists.</p>
		</br>
		</br>
	</div>
    `;
    return '';
}

// Update handleRouteChange to render views
function handleRouteChange() {
    const path = window.location.pathname;
    let view;
	if (path === '/game/') {
        view = gameView();
		return ;
    } else if (/^\/profile\/\d+\/$/.test(path)) {  // Utilisation d'une expression régulière pour capturer n'importe quel nombre
        const userId = path.split('/')[2];
        view = profileView(userId);
		return ;
    } else if (path === '/404/') {
        view = View404();
		return ;
    } else {
        view = homeView();
		return ;
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