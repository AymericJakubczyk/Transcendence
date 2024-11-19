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
