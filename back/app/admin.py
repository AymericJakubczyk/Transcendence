from django.contrib import admin
from .models import User, Friend_Request

# Register your models here.

admin.site.register(User)
admin.site.register(Friend_Request)