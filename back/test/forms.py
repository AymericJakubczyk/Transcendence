from django import forms
from .models import Member

class RegisterForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = ['pseudo', 'first_name', 'second_name']