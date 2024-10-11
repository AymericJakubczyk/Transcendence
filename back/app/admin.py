from django.contrib import admin
from .models import User, Friend_Request, Discussion, Message, Game_Chess, Tournament, Game_Pong

# Register your models here.


class MessageAdmin(admin.ModelAdmin):
	list_display = ('discussion', 'sender', 'message', 'read')
admin.site.register(User)
admin.site.register(Friend_Request)
admin.site.register(Discussion)
admin.site.register(Message, MessageAdmin)
admin.site.register(Game_Chess)
admin.site.register(Tournament)
admin.site.register(Game_Pong)