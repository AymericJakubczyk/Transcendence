from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from .forms import SignupForm, LoginForm, UpdateForm
from .models import User
from django.urls import reverse as get_url
import sys
import logging


logger = logging.getLogger(__name__)

# Create your views here.

@login_required
def logout_user(request):
    print("LOGOUT", request.user, file=sys.stderr)
    logout(request)
    return (redirect('myprofile'))

def homeView(request):
    next_url = get_url('home')
    if (request.GET.get('next')):
        next_url = request.GET.get('next')
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
                return (redirect(next_url))
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'home.html', 'form':form, 'next_url':next_url})
    return render(request, 'home.html', {'form':form, 'next_url':next_url})


def gameView(request):
    if request.user.is_authenticated:
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'game.html', 'user':request.user})
        return render(request, 'game.html', {'user':request.user})
    else:
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'game.html'})
        return render(request, 'game.html')

def registrationView(request):
    if request.method == 'POST':
        form = SignupForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            if request.FILES:
                logger.info(f"Files received: {request.FILES}")
            else:
                logger.warning("No files received")

            user.save()
            # auto-login user
            login(request, user)
            return redirect('myprofile')
        else:
            logger.warning(f"Form errors: {form.errors}")
    else:
        form = SignupForm()
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'registration.html', 'form':form})
    return render(request, 'registration.html', {'form': form})

def myProfilView(request):

    if request.user.is_authenticated:
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'myprofil.html', 'user':request.user})
        return render(request, 'myprofil.html', {'user':request.user})

    next_url = get_url('myprofile')
    if (request.GET.get('next')):
        next_url = request.GET.get('next')
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
                return (redirect(next_url))
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'myprofil.html', 'form':form, 'next_url':next_url})
    return render(request, 'myprofil.html', {'form':form, 'next_url':next_url})

def profilView(request, username):
    user = get_object_or_404(User, username=username)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'profil.html', 'user':user})
    return render(request, 'profil.html', {'user':user})

def custom_404(request, exception):
    return render(request, 'index.html', {})

@login_required
def updateProfile(request):
    user = request.user
    if request.method == 'POST':
        form = UpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            updated = form.save(commit=False)
            if request.FILES:
                logger.info(f"Files received: {request.FILES}")
            else:
                logger.warning("No files received")
            updated.save()
            return redirect('myprofile')
        else:
            logger.warning(f"Form errors: {form.errors}")
    else:
        form = UpdateForm(instance=user)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'update_profile.html', 'form':form, 'user':user})
    return render(request, 'update_profile.html', {'form':form, 'user':user})

def password_change(request):
    form = PasswordChangeForm(user=request.user)
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            return redirect('myprofile')
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'password_change.html', 'form':form})
    return render(request, 'password_change.html', {'form':form})