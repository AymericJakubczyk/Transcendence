from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from .forms import RegisterForm
from .models import Member

def render_spa(request):
	return render(request, 'index.html')

def custom_404(request, exception):
    return render(request, 'index.html', {})

# REGISTRATION
def register_user(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Process the form data
            # Assuming you want to do something with the form data
            pseudo = form.cleaned_data['pseudo']
            first_name = form.cleaned_data['first_name']
            second_name = form.cleaned_data['second_name']
            print("DATA : %s, %s, %s" % (pseudo, first_name, second_name))
            new_user = form.save()
            new_user.user_id = Member.objects.count()
            new_user.save()
            # Redirect after POST
            # This prevents form resubmission on page refresh
            return render(request, 'index.html', {})  # Redirect to a success page
    else:
        form = RegisterForm()

    # If it's a GET request or the form is invalid, render the form on the template
    return render(request, 'index.html', {'RegisterForm': form})



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
