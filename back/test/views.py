from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm
from .forms import SignupForm, LoginForm
from .models import Member, User

import sys

def render_spa(request):
	return render(request, 'index.html')


def logout_user(request):
    print("LOGOUT", request.user, file=sys.stderr)
    logout(request)
    return (redirect('home'))

def homeView(request):
    # print(request.user.email, file=sys.stderr)
    form = LoginForm()
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
                return (redirect('home'))
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'home.html', 'form':form})
    return render(request, 'home.html', {'form':form})

def gameView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'game.html'})
    return render(request, 'game.html')

def registrationView(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            # auto-login user
            login(request, user)
            return (redirect('home'))
    else:
        form = SignupForm()
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'registration.html', 'form':form})
    return render(request, 'registration.html', {'form': form})

@login_required
def myProfilView(request):
    user = get_object_or_404(User, id=request.user.id)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'profil.html', 'user':user})
    return render(request, 'profil.html', {'user':user})

def profilView(request, user_id):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'profil.html', 'user':{'pseudo':'test'}})
    return render(request, 'profil.html', {'user':{'pseudo':'test'}})

def custom_404(request, exception):
    return render(request, 'index.html', {})


# RECUPERATION DE DONNEES USER

def get_profile_info(request, user_id):
    print("Searching user with id: %d" % user_id)
    user = get_object_or_404(Member, id = user_id)
    return render(request, 'index.html', {'user': user})

def get_profile_info_json(request, user_id):
    user = get_object_or_404(Member, id=user_id)
    user_info = {
        'pseudo': user.pseudo,
        'first': user.first_name,
        'second': user.second_name,
    }
    return JsonResponse(user_info)
