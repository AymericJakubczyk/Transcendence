from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, SignupFormBis, LoginForm, UpdateForm
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
    viewForm = "viewForm/login.html"

    if request.method == 'POST':
        if (request.POST.get('loginForm')):
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
            else:
                print("form not valid", form.errors, file=sys.stderr)
        elif (request.POST.get('registration1Form')):
            form = SignupForm(request.POST)
            if form.is_valid():
                # Store form data in session for get them in second step
                signup_data = form.save(commit=False)
                request.session['signup_data'] = {
                    'first_name': signup_data.first_name,
                    'last_name': signup_data.last_name,
                    'email': signup_data.email,
                    'password': signup_data.password,
                }
                form = SignupFormBis()
                return render(request, 'viewForm/registration2.html', {'form':form})
            else:
                viewForm = "viewForm/registration1.html"
                return render(request, 'viewForm/registration1.html', {'form':form})

        elif (request.POST.get('registration2Form')):
            form = SignupFormBis(request.POST, request.FILES)
            if form.is_valid():
                user = form.save(commit=False)
                # Get data from step1 and add them to user
                signup_data = request.session.get('signup_data')
                user.first_name = signup_data['first_name']
                user.last_name = signup_data['last_name']
                user.email = signup_data['email']
                user.set_password(signup_data['password'])
                user.save()
                login(request, user)

                # Delete session data
                del request.session['signup_data']
                return redirect('myprofile')
            else:
                viewForm = "viewForm/registration2.html"


    if request.method == 'GET' and request.GET.get('login'):
        print("get", request.GET, file=sys.stderr)
        return render(request, 'viewForm/login.html', {'form':form})
    if request.method == 'GET' and request.GET.get('registration1'):
        print("get", request.GET, file=sys.stderr)
        form = SignupForm()
        return render(request, 'viewForm/registration1.html', {'form':form})

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'login.html', 'form':form, 'viewForm':viewForm, 'error':error})
    return render(request, 'login.html', {'form':form, 'viewForm':viewForm, 'error':error})


def gameView(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('home')
    else:
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'game.html', 'user':request.user})
        return render(request, 'game.html', {'user':request.user})

def custom_404(request, exception):
    return render(request, 'index.html', {})
