from django import forms
from .models import User
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm


class SignupForm(UserCreationForm):  

    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ('first_name', 'last_name', 'email')

class SignupFormBis(forms.ModelForm):
    profile_picture = forms.ImageField(required=False)

    class Meta():
        model = get_user_model()
        fields = ('profile_picture', 'username')

class LoginForm(forms.Form):
    username = forms.CharField(max_length=63, label='Nom d’utilisateur')
    password = forms.CharField(max_length=63, widget=forms.PasswordInput, label='Mot de passe')

class UpdateForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'first_name', 'last_name', 'profile_picture')
