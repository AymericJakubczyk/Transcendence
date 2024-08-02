from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from .forms import SignupForm, LoginForm, UpdateForm
from .models import User, Friend_Request, Discussion, Message, Game
from django.urls import reverse as get_url
from django.db.models import Q

import sys
import logging
from django.contrib import messages


logger = logging.getLogger(__name__)

# Create your views here.

@login_required
def logout_user(request):
    print("LOGOUT", request.user, file=sys.stderr)
    logout(request)
    return (redirect('myprofile'))

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

def gameView(request):
    if request.user.is_authenticated == False:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('myprofile')
    else:
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'game.html', 'user':request.user})
        return render(request, 'game.html', {'user':request.user})

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
        all_friend_requests = Friend_Request.objects.filter(to_user=request.user)
        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'myprofil.html', 'user':request.user, 'all_friend_requests': all_friend_requests})
        return render(request, 'myprofil.html', {'user':request.user, 'all_friend_requests': all_friend_requests})

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
            if not updated.profile_picture :
                updated.profile_picture = 'imgs/profils/creepy-cat.webp'
            updated.save()
            return redirect('myprofile')
        else:
            logger.warning(f"Form errors: {form.errors}")
    else:
        form = UpdateForm(instance=user)

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'update_profile.html', 'form':form, 'user':user})
    return render(request, 'update_profile.html', {'form':form, 'user':user})

@login_required
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

@login_required
def send_friend_request(request, username):
    from_user = request.user
    to_user = get_object_or_404(User, username=username)
    friend_request, created = Friend_Request.objects.get_or_create(from_user=from_user, to_user=to_user)
    if created:
        messages.success(request, 'Friend request sent')
        return redirect('profile', username=to_user.username)
    else :
        messages.info(request, 'Friend request already sent')
        return redirect('profile', username=to_user.username)

@login_required
def accept_friend_request(request, requestID):
    friend_request = Friend_Request.objects.get(id=requestID)
    if friend_request.to_user == request.user:
        friend_request.to_user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(friend_request.to_user)
        friend_request.delete()
        messages.success(request, 'Friend request accepted')
        return redirect('myprofile')
    else :
        messages.error(request, 'Friend request not accepted')
        return redirect('myprofile')

def chatView(request):

    if request.user.is_authenticated == False:
        messages.error(request, 'Log-in to chat with friends !')
        return redirect('myprofile')

    interlocutor = None
    msg = None
    current_discu = None
    current_user = request.user

    if 'add_discussion' in request.POST:
        print("[ADD]", file=sys.stderr)
        interlocutor = get_object_or_404(User, username=request.POST.get('add_discussion'))
        obj = Discussion()
        obj.user1 = interlocutor
        obj.user2 = current_user
        obj.save()
        current_discu = obj

    if 'change_discussion' in request.POST:
        discu = get_object_or_404(Discussion, id=request.POST.get('change_discussion'))
        current_discu = discu
        interlocutor = discu.get_other_username(current_user.username)

    if 'msg' in request.POST:
        msg = request.POST.get('msg')
        current_discu = get_object_or_404(Discussion, id=request.POST.get('discu_id'))
        other_user = current_discu.get_other_username(current_user.username)
        interlocutor = get_object_or_404(User, username=other_user)
        obj = Message()
        obj.discussion = current_discu
        obj.sender = current_user
        obj.message = msg
        obj.save()

    all_user = User.objects.all()
    all_message = Message.objects.filter(Q(discussion=current_discu))
    all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user))
    all_discussion_name = []
    all_username = []
    for discussion in all_discussion:
        obj = {'id': discussion.id, 'name_discu':discussion.get_other_username(current_user.username)}
        all_discussion_name.append(obj)
        all_username.append(discussion.get_other_username(current_user.username))


    all_addable_user = []
    for usr in all_user:
        if usr.username not in all_username:
            all_addable_user.append({'username':usr.username})


    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chat.html', 'interlocutor':interlocutor, 'all_user':all_addable_user, 'all_discussion': all_discussion_name, 'current_discu':current_discu, 'all_message': all_message})
    return render(request, 'chat.html', {'interlocutor':interlocutor, 'all_user':all_addable_user, 'all_discussion': all_discussion_name, 'current_discu':current_discu, 'all_message': all_message})


# API

from rest_framework.viewsets import ModelViewSet

from .serializers import GameSerializer

class GameViewSet(ModelViewSet):
    
    serializer_class = GameSerializer

    def get_queryset(self):
        return Game.objects.all()