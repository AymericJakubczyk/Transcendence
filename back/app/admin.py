from django.contrib import admin
from .models import User, Friend_Request, Discussion, Message, Game_Chess, Tournament, Game_Pong, Invite, PongMultiDataGame

# Register your models here.


class MessageAdmin(admin.ModelAdmin):
	list_display = ('discussion', 'sender', 'message', 'read')
class InviteAdmin(admin.ModelAdmin):
	list_display = ('id', 'from_user', 'to_user', 'game_type')

admin.site.register(User)
admin.site.register(Friend_Request)
admin.site.register(Discussion)
admin.site.register(Message, MessageAdmin)
admin.site.register(Game_Chess)
admin.site.register(Tournament)
admin.site.register(Game_Pong)
admin.site.register(Invite, InviteAdmin)
admin.site.register(PongMultiDataGame)