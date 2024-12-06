from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess
from django.urls import reverse as get_url
from django.db.models import Q
import json
from django.http import JsonResponse, HttpResponse

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)

# Create your views here.

def homeView(request):

    if request.user.is_authenticated:
        return redirect('myprofile')

    form = LoginForm()
    error = None

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
            )
            if user is not None:
                print("login", request.user, file=sys.stderr)
                login(request, user)
                return redirect('myprofile')
            else:
                if User.objects.filter(username=form.cleaned_data['username']).exists():
                    error = "password"
                else:
                    error = "username"
                    form = LoginForm()

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'login.html', 'form':form, 'error':error})
    return render(request, 'login.html', {'form':form, 'error':error})


def gameView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('myprofile')
    else:
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'game.html', 'user':request.user})
        return render(request, 'game.html', {'user':request.user})

def custom_404(request, exception):
    return render(request, 'index.html', {})



from django.shortcuts import redirect
from django.contrib.auth import login
from django.http import HttpResponseRedirect
import requests

def oauth42_login(request):
    # L'URL d'autorisation de 42
    oauth_url = 'https://api.intra.42.fr/oauth/authorize'
    
    # Les paramètres nécessaires
    params = {
        'client_id': 'u-s4t2ud-4563ca57b3380ce7bbccc561b5016566f1f437071451a54f27e316f5501a2f57',
        'redirect_uri': 'http://localhost:8042/oauth/callback/',
        'response_type': 'code',
        'scope': 'public'
    }
    
    # Construire l'URL complète
    authorization_url = f"{oauth_url}?{'&'.join(f'{key}={value}' for key, value in params.items())}"
    
    # Rediriger vers 42
    return redirect(authorization_url)

def oauth42_callback(request):
    code = request.GET.get('code')
    
    if not code:
        # Gérer l'erreur si pas de code
        return redirect('login')
        
    try:
        # Échanger le code contre un token
        token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-4563ca57b3380ce7bbccc561b5016566f1f437071451a54f27e316f5501a2f57',
            'client_secret': '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',
            'code': code,
            'redirect_uri': 'http://localhost:8042/oauth/callback/'
        })
        
        token_data = token_response.json()
        
        # Obtenir les informations de l'utilisateur avec le token
        user_response = requests.get('https://api.intra.42.fr/v2/me', 
            headers={'Authorization': f"Bearer {token_data['access_token']}"})
        user_data = user_response.json()
        
        # Ici, vous devez implémenter la logique pour créer/mettre à jour
        # l'utilisateur dans votre base de données
        # Par exemple:
        user, created = User.objects.get_or_create(
            username=user_data['login'],
            defaults={
                'email': user_data['email'],
                # autres champs...
            }
        )
        
        # Connecter l'utilisateur
        login(request, user)
        
        # Rediriger vers la page souhaitée après connexion
        return redirect('home')  # ou 'dashboard', etc.
        
    except Exception as e:
        print(f"Erreur lors de l'authentification: {e}")
        return redirect('login')
