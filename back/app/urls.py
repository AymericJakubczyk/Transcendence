from django.urls import path, include
from .views import views
from .views.pong import pong, pongMultiplayer, pongAI
from .views.chess import chess
from .views.users import users, chat, profils
from .views.web3 import sepoliaTournament
from django.contrib.auth.views import PasswordChangeView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('', views.homeView, name='home'),
	path('game/', views.gameView, name='game'),

	path('game/pong/', pong.pongModeView, name='pong'),
    path('game/pong/tournament/', pong.pongTournament, name='pong_tournament'),
    path('game/pong/tounament/cancel/<int:gameID>/', pong.pongCancelWaitingTournament, name='pong_cancel_waiting_tournament'),
	path('game/pong/local/', pong.pongLocalView, name='pong_local'),
	path('game/pong/local/vs-player', pong.pongView, name='pong_local_game'),
	path('game/pong/local/vs-ia/', pongAI.pongAISetup, name='pong_ai_game'),
	path('game/pong/local/vs-ia/<int:gameID>/', pongAI.pongAIGame, name='pong_ai'),
    path('game/pong/ranked/', pong.pongFoundGameView, name='pong_found_game'),
    path('game/pong/ranked/cancel/', pong.pongCancelQueue, name='pong_cancel_queue'),
    path('game/pong/ranked/<int:gameID>/', pong.pongGameView, name='pong_game'),

    path('game/pong/multiplayer/', pongMultiplayer.pongFoundMultiView, name='pong_multi_found'),
    path('game/pong/multiplayer/cancel/', pongMultiplayer.pongMultiCancelQueue, name='pong_multi_cancel_queue'),
    path('game/pong/multiplayer/<int:gameID>/', pongMultiplayer.pongMultiplayer, name='pong_multiplayer'),


	path('game/chess/', chess.chessModeView, name='chess'),
    path('game/chess/local/', chess.chessView, name='chess_local'),
    path('game/chess/ranked/', chess.chessFoundGameView, name='chess_found_game'),
    path('game/chess/ranked/cancel/', chess.chessCancelQueue, name='chess_cancel_queue'),
    path('game/chess/ranked/<int:gameID>/', chess.chessGameView, name='chess_game'),
    
    path('profile/', profils.myProfilView, name='myprofile'),
    path('profile/<str:username>/', profils.profilView, name='profile'),
	path('update-profile/', profils.updateProfile, name='update-profile'),
    path('change-password/', profils.password_change, name='password_change'),

    path('logout/', users.logout_user, name='logout'),

    path('chat/', chat.chatView, name='chat'),
    path('mini_chat/', chat.mini_chat),

	path('send_friend_request/<str:username>/', users.send_friend_request, name='send_friend_request'),
	path('accept_friend_request/<int:requestID>/', users.accept_friend_request, name='accept_friend_request'),
    
    path('remove_friend/<str:username>/', users.remove_friend, name='remove_friend'),

    path('block_user/<str:username>/', users.block_user, name='block_user'),
    path('unblock_user/<str:username>/', users.unblock_user, name='unblock_user'),

    path('invite/', chat.invite, name='invite'),
    path('invite/cancel/', chat.inviteCancel, name='invite_cancel'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)