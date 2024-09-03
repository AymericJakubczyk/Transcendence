from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from .forms import SignupForm, LoginForm, UpdateForm
from .models import User, Tournament, Friend_Request, Discussion, Message, Game_Chess
from django.urls import reverse as get_url
from django.db.models import Q
import json
from django.http import JsonResponse, HttpResponse

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
    if not request.user.is_authenticated:
        messages.error(request, 'Log-in to play cool games !')
        return redirect('myprofile')
    else:
        print("REQUETE POST :")
        print(request.POST)
        all_tournaments = Tournament.objects.all()
        if 'create_tournament' in request.POST:
            game_played = request.POST.get('crea-game')
            max_users = request.POST.get('group-size')
            if game_played:
                obj = Tournament()
                obj.host_user = request.user
                obj.game_played = game_played
                obj.max_users = max_users
                obj.save()
                obj.participants.add(request.user)
                obj.save()
                request.user.tournament_id = obj.id
                request.user.save()

        if 'join_tournament' in request.POST:
            tournament_id = request.POST.get('join_tournament')
            tournament = Tournament.objects.get(id=tournament_id)
            if request.user not in tournament.participants.all():
                tournament.participants.add(request.user)
                tournament.save()
                request.user.tournament_id = tournament.id
                request.user.save()

        if request.META.get("HTTP_HX_REQUEST") != 'true':
            return render(request, 'page_full.html', {'page':'game.html', 'user':request.user, 'all_tournaments': all_tournaments})
        return render(request, 'game.html', {'user':request.user, 'all_tournaments': all_tournaments})

def pongView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'pong.html', 'user':request.user})
    return render(request, 'pong.html', {'user':request.user})

@login_required
def chessView(request):
    user = get_object_or_404(User, id=request.user.id)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chess.html', 'user':user})
    return render(request, 'chess.html', {'user':user})

def chessModeView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chessMode.html', 'user':request.user})
    return render(request, 'chessMode.html', {'user':request.user})

def chessFoundGameView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chessFoundGame.html', 'user':request.user})
    return render(request, 'chessFoundGame.html', {'user':request.user})

def chessGameView(request, gameID):
    game = get_object_or_404(Game_Chess, id=gameID)
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'chess.html', 'user':request.user, 'game':game})
    return render(request, 'chess.html', {'user':request.user, 'game':game})

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
            return render(request, 'page_full.html', {'page':'myprofil.html', 'user':request.user, 'all_friend_requests': all_friend_requests, 'refresh':True})
        return render(request, 'myprofil.html', {'user':request.user, 'all_friend_requests': all_friend_requests, 'refresh':False})

    next_url = get_url('myprofile')
    if (request.GET.get('next')):
        next_url = request.GET.get('next')
    form = LoginForm()

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            print("form valid", file=sys.stderr)
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
    print("[CHAT]", request.POST, request.body, request.user, file=sys.stderr)
    if request.user.is_authenticated == False:
        messages.error(request, 'Log-in to chat with friends !')
        return redirect('myprofile')

    interlocutor = None
    msg = None
    current_discu = None
    error = None
    current_user = request.user

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
    all_message = Message.objects.filter(Q(discussion=current_discu)).order_by('id')
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