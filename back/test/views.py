from django.http import HttpResponse
from django.template import loader
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from .forms import RegisterForm
from .models import Member

def render_spa(request):
	template = loader.get_template('index.html')
	return HttpResponse(template.render({}, request))

def custom_404(request, exception):
    return render(request, 'index.html', {})

def register_user(request):
    template = loader.get_template('index.html')
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
            return HttpResponse(template.render({}, request))  # Redirect to a success page
    else:
        form = RegisterForm()

    # If it's a GET request or the form is invalid, render the form on the template
    return HttpResponse(template.render({'RegisterForm': form}, request))

def get_profile_info(request, user_id):
    print("Searching user with id: %d" % user_id)
    user = get_object_or_404(Member, id = user_id)
    return render(request, 'index.html', {'user': user})
