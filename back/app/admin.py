from django.contrib import admin
from .models import User, Friend_Request, Discussion, Message, Game, Pong

# Register your models here.


class MessageAdmin(admin.ModelAdmin):
	list_display = ('discussion', 'sender', 'message')

admin.site.register(User)
admin.site.register(Friend_Request)
admin.site.register(Discussion)
admin.site.register(Message, MessageAdmin)
admin.site.register(Game)
admin.site.register(Pong)

class Game(admin.ModelAdmin):
	list_display = ('player1', 'player2', 'gametype', 'over', 'winner')