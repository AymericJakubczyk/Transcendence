from django import forms
from .models import userTest

class RegisterForm(forms.ModelForm):
    class Meta:
        model = userTest
        fields = ['pseudo', 'first_name', 'second_name']