from django.contrib import admin
from .models import User, Discussion, Message

# Register your models here.

admin.site.register(User)
admin.site.register(Discussion)
admin.site.register(Message)