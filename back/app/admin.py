from django.contrib import admin
from .models import User, Friend_Request, Discussion, Message

# Register your models here.


class MessageAdmin(admin.ModelAdmin):
	list_display = ('discussion', 'sender', 'message', 'read')
admin.site.register(User)
admin.site.register(Friend_Request)
admin.site.register(Discussion)
admin.site.register(Message, MessageAdmin)