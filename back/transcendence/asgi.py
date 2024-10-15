"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import re_path
import os

from app.consumers.chatConsumer import ChatConsumer
from app.consumers.chessConsumer import ChessConsumer
from app.consumers.pongConsumer import PongConsumer
from app.consumers.pongTournamentConsumer import pongTournamentConsumer
from app.consumers.pongMultiplayerConsumer import PongMultiplayerConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')


websocket_urlpatterns = [
	re_path(r'ws/chat/$', ChatConsumer.as_asgi()),
	re_path(r'ws/chess/$', ChessConsumer.as_asgi()),
	re_path(r'ws/pong/$', PongConsumer.as_asgi()),
	re_path(r'ws/pongTournament/$', pongTournamentConsumer.as_asgi()),
	re_path(r'ws/pongMultiplayer/$', PongMultiplayerConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter(
			websocket_urlpatterns
		)
	),
})
