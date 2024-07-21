from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.core import serializers
from .forms import SignupForm, LoginForm
from .models import User, Discussion
from django.urls import reverse as get_url
from django.db.models import Q

import sys

# Create your views here.

def logout_user(request):
    print("LOGOUT", request.user, file=sys.stderr)
    logout(request)
    return (redirect('home'))

def homeView(request):
    print("[TEST]", request.POST, file=sys.stderr)
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
        return render(request, 'page_full.html', {'page':'home.html', 'form':form, 'next_url':next_url, 'refresh':1})
    return render(request, 'home.html', {'form':form, 'next_url':next_url, 'refresh':0})

@login_required
def gameView(request):
    user = get_object_or_404(User, id=request.user.id)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'game.html', 'user':user})
    return render(request, 'game.html', {'user':user})

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
    user = get_object_or_404(User, id=user_id)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'profil.html', 'user':user})
    return render(request, 'profil.html', {'user':user})

def custom_404(request, exception):
    return render(request, 'index.html', {})

@login_required
def chatView(request):
    receiver = None
    msg = None
    current_discu = None
    if 'add_discussion' in request.POST:
        print("[ADD]", file=sys.stderr)
        receiver = get_object_or_404(User, username=request.POST.get('add_discussion'))
        obj = Discussion()
        obj.user1 = receiver
        obj.user2 = request.user
        obj.save()
        current_discu = obj

    if 'change_discussion' in request.POST:
        discu = get_object_or_404(Discussion, id=request.POST.get('change_discussion'))
        current_discu = discu
        receiver = discu.get_other_username(request.user.username)

    if 'msg' in request.POST:
        msg = request.POST.get('msg')
        current_discu = get_object_or_404(Discussion, id=request.POST.get('discu_id'))
        receiver = current_discu.get_other_username(request.user.username)

    all_user = User.objects.all()

    current_user = request.user

    all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user))
    all_discussion_name = []
    all_username = []
    for discussion in all_discussion:
        obj = {'id': discussion.id, 'name_discu':discussion.get_other_username(request.user.username)}
        all_discussion_name.append(obj)
        all_username.append(discussion.get_other_username(request.user.username))


    all_addable_user = []
    for usr in all_user:
        if usr.username not in all_username:
            all_addable_user.append({'username':usr.username})


    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chat.html', 'receiver':receiver, 'all_user':all_addable_user, 'all_discussion': all_discussion_name, 'current_discu':current_discu})
    return render(request, 'chat.html', {'receiver':receiver, 'all_user':all_addable_user, 'all_discussion': all_discussion_name, 'current_discu':current_discu})