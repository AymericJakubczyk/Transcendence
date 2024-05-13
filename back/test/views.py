from django.http import HttpResponse
from django.template import loader
from django.shortcuts import render
from .forms import RegisterForm

def test(request):
    template = loader.get_template('index.html')
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Process the form data
            # Assuming you want to do something with the form data
            pseudo = form.cleaned_data['pseudo']
            first_name = form.cleaned_data['first_name']
            second_name = form.cleaned_data['second_name']
            print("DATA : %s, %s, %s", pseudo, first_name, second_name)
            form.save()
            # Redirect after POST
            # This prevents form resubmission on page refresh
            return HttpResponse(template.render())  # Redirect to a success page
    else:
        form = RegisterForm()

    # If it's a GET request or the form is invalid, render the form on the template
    return HttpResponse(template.render({'RegisterForm': form}, request))
