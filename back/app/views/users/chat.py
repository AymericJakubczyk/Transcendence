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

def chatView(request):
        
    print("[CHAT]", request.POST, request.body, request.user, file=sys.stderr)
    if request.user.is_authenticated == False:
        messages.error(request, 'Log-in to chat with friends !')
        return redirect('myprofile')

    interlocutor = None
    msg = None
    current_discu = None
    error = None
    current_user = request.user
    # get more message when you scroll to the top
    if request.method == 'GET' and request.headers.get('type') and request.headers.get('type') == 'more_message':
        print("[GET MORE MESSAGE]", request.headers.get('nbrMessage'), request.headers.get('id'), file=sys.stderr)
        discu = get_object_or_404(Discussion, id=request.headers.get('id'))
        nbr_message = int(request.headers.get('nbrMessage'))
        more_message = Message.objects.filter(Q(discussion=discu)).order_by('-id')[nbr_message:nbr_message+42]
        json_message = []
        for msg in more_message:
            json_message.append({'message':msg.message, 'sender':msg.sender.username})

        return JsonResponse({'more_message': json_message, 'current_username':request.user.username})

    if 'add_discussion' in request.POST:
        print("[ADD]", file=sys.stderr)
        interlocutor = get_object_or_404(User, username=request.POST.get('add_discussion'))
        obj = Discussion()
        obj.user1 = interlocutor
        obj.user2 = current_user
        obj.save()
        current_discu = obj

    elif 'change_discussion' in request.POST:
        print("[CHANGE]", file=sys.stderr)
        discu = get_object_or_404(Discussion, id=request.POST.get('change_discussion'))
        if (discu.user1 != current_user and discu.user2 != current_user):
            print("[ERROR]", file=sys.stderr)
            error = "You are not in this discussion"
        else:
            current_discu = discu
            other_user = current_discu.get_other_username(current_user.username)
            interlocutor = get_object_or_404(User, username=other_user)
            last_message = current_discu.get_last_message()
            if last_message and last_message.sender != current_user:
                last_message.read = True
                last_message.save()

    elif 'display_profile' in request.POST:
        interlocutor = get_object_or_404(User, username=request.POST.get('display_profile'))
        return redirect('profile', username=interlocutor.username)

    elif request.method == 'POST':
        jsonData = json.loads(request.body)
        if jsonData.get('read'):
            current_discu = get_object_or_404(Discussion, id=jsonData.get('read'))
            last_message = current_discu.get_last_message()
            last_message.read = True
            last_message.save()

    all_user = User.objects.all()
    # get 42 last message
    all_message = Message.objects.filter(Q(discussion=current_discu)).order_by('-id')[0:42:-1]
    all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user)).order_by('-last_activity')
    all_discussion_name = []
    all_username = []
    for discussion in all_discussion:
        other_username = discussion.get_other_username(current_user.username)
        other_user = get_object_or_404(User, username=other_username)
        obj = {'id': discussion.id, 'name_discu':other_username, 'last_message':discussion.get_last_message(), 'profile_picture':other_user.profile_picture, 'other_user':other_user}
        all_discussion_name.append(obj)
        all_username.append(other_username)


    all_addable_user = []
    for usr in all_user:
        if usr.username not in all_username:
            all_addable_user.append({'username':usr.username})


    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chat.html', 'interlocutor':interlocutor, 'all_user':all_addable_user, 'all_discussion': all_discussion_name, 'current_discu':current_discu, 'all_message': all_message, 'error':error})
    return render(request, 'chat.html', {'interlocutor':interlocutor, 'all_user':all_addable_user, 'all_discussion': all_discussion_name, 'current_discu':current_discu, 'all_message': all_message, 'error':error})





def mini_chat(request):
    current_user = request.user
    all_discussion_name = []
    all_obj_msg = []
    if request.method == "POST" and request.user.is_authenticated:
        jsonData = json.loads(request.body)
        request_type = jsonData.get('type')
        if (request_type == "get_all"):
            all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user)).order_by('-last_activity')
            for discussion in all_discussion:
                other_username = discussion.get_other_username(current_user.username)
                other_user = get_object_or_404(User, username=other_username)
                last_message = discussion.get_last_message()
                if last_message:
                    sender = last_message.sender.username
                    is_readed = last_message.read
                    last_message = last_message.message
                else:
                    last_message = "No message"
                    sender = "No sender"
                    is_readed = True
                obj = { 
                    'id': discussion.id,
                    'name_discu':other_username,
                    'profile_picture':other_user.profile_picture.url,
                    'last_message':last_message,
                    'last_message_sender':sender,
                    'last_message_is_readed':is_readed,
                    'state':other_user.state
                }
                all_discussion_name.append(obj)
            return JsonResponse({'type': request_type, 'all_discu': all_discussion_name, 'current_username':current_user.username})
        elif (request_type == "get_discu"):
            discu = get_object_or_404(Discussion, id=jsonData.get('id'))
            last_message = discu.get_last_message()
            if (last_message and last_message.sender != current_user):
                last_message.read = True
                last_message.save()
            all_message = Message.objects.filter(Q(discussion=discu)).order_by('id')
            for msg in all_message:
                obj = {'message': msg.message, 'sender':msg.sender.username}
                all_obj_msg.append(obj)
            return JsonResponse({'type': request_type, 'all_message': all_obj_msg, 'current_username':current_user.username})
        elif (request_type == "get_global_notif"):
            all_discussion = Discussion.objects.filter(Q(user1=current_user) | Q(user2=current_user))
            for discussion in all_discussion:
                last_message = discussion.get_last_message()
                if last_message and not last_message.read and last_message.sender != current_user:
                    return JsonResponse({'type': request_type, 'notif': True})
            return JsonResponse({'type': request_type, 'notif': False})
        return JsonResponse({'type': request_type})
    else:
        return JsonResponse({'type': 'error', 'message':'not authenticated or not good request'})