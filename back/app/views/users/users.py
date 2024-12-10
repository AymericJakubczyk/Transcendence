from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from app.forms import SignupForm, LoginForm, UpdateForm
from app.models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess
from django.urls import reverse as get_url
from django.db.models import Q

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from django.http import JsonResponse, HttpResponse

import sys
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)

@login_required
def logout_user(request):
    print("LOGOUT", request.user, file=sys.stderr)
    logout(request)
    return (redirect('home'))

@login_required
def send_friend_request(request, username):
    from_user = request.user
    to_user = get_object_or_404(User, username=username)
    friend_request, created = Friend_Request.objects.get_or_create(from_user=from_user, to_user=to_user)
    if created:
        messages.success(request, 'Friend request sent')
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            to_user.username, {
                'type': 'send_ws',
                'type2': 'friend_request',
                'from_user': from_user.username,
                'id': friend_request.id
            }
        )
        return redirect('profile', username=to_user.username)
    else :
        messages.info(request, 'Friend request already sent')
        return redirect('profile', username=to_user.username)

@login_required
def accept_friend_request(request, requestID):
    friend_request = get_object_or_404(Friend_Request, id=requestID)
    if friend_request.to_user == request.user:
        friend_request.to_user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(friend_request.to_user)
        friend_request.delete()
        messages.success(request, 'Friend request accepted')
        return redirect('myprofile')
    else :
        messages.error(request, 'Friend request not accepted')
        return redirect('myprofile')

@login_required
def remove_friend(request, username):
    to_user = get_object_or_404(User, username=username)
    request.user.friends.remove(to_user)
    return redirect('profile', username=to_user.username)


@login_required
def block_user(request, username):
    print("[BLOCK]", request.user, username, file=sys.stderr)
    user = get_object_or_404(User, username=username)
    request.user.blocked_users.add(user)
    return redirect('profile', username=user.username)

@login_required
def unblock_user(request, username):
    print("[UNBLOCK]", request.user, username, file=sys.stderr)
    user = get_object_or_404(User, username=username)
    request.user.blocked_users.remove(user)
    return redirect('profile', username=user.username)

