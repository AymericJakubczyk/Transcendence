from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from .forms import RegisterForm
from .models import Member

def render_spa(request):
	return render(request, 'index.html')

def homeView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'home.html'})
    return render(request, 'home.html')

def gameView(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'game.html'})
    return render(request, 'game.html')

def registrationView(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            return (redirect('home'))
    else:
        form = RegisterForm()
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'page_full.html', {'page':'registration.html', 'form':form})
    return render(request, 'registration.html', {'form': form})

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
