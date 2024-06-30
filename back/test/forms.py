from django import forms
from .models import Member
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

class RegisterForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = ['pseudo', 'first_name', 'second_name']

class LoginForm(forms.Form):
    username = forms.CharField(max_length=63, label='Nom d’utilisateur')
    password = forms.CharField(max_length=63, widget=forms.PasswordInput, label='Mot de passe')
