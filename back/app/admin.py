from django.contrib import admin
from .models import User, Discussion, Message

# Register your models here.


class MessageAdmin(admin.ModelAdmin):  # nous insérons ces deux lignes..
	list_display = ('discussion', 'sender', 'message')

admin.site.register(User)
admin.site.register(Discussion)
admin.site.register(Message, MessageAdmin)