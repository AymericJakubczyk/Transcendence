from django.contrib import admin
from .models import userTest

# Register your models here.

@admin.register(userTest)
class userTestAdmin(admin.ModelAdmin):
    list_display = ('pseudo', 'first_name', 'second_name')