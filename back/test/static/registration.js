function registrationView() {
    console.log("Registration view called");

    const registrationFormTemplate = document.getElementById('form-template').innerHTML;

    document.getElementById('page').innerHTML = `
        <div class="container">
            <h1 class="text-center">REGISTER</h1>
            <br>
            ${registrationFormTemplate}
        </div>
    `;

    const registrationForm = document.getElementById('register-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();  // Empêcher la soumission du formulaire par défaut

            const formData = new FormData(registrationForm);

            fetch(registrationForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': registrationForm.querySelector('[name=csrfmiddlewaretoken]').value,
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('page').innerHTML = `
                    <div class="container">
                    <br>
                    <br>
                    <br>
                    <br>
                    <h1 class="text-center text-success">REGISTRATION DONE</h1>
                    </div>
                    `;
                    setTimeout(() => {
                        // Changer l'URL sans recharger la page
                        history.pushState(null, '', data.redirect_url);
                        // Charger le contenu correspondant à la nouvelle URL
                        handleRouteChange();
                    }, 800);
                } else {
                    alert('La soumission du formulaire a échoué.');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
        });
    } else {
        console.error('Formulaire non trouvé après injection !');
    }
}
