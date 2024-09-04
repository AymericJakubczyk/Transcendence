from django.conf.urls import handler404
from django.urls import path
from .views import views
from .views.pong import pong
from .views.chess import chess
from .views.users import users, chat, profils
from .views.views import custom_404
from django.contrib.auth.views import PasswordChangeView


handler404 = custom_404

urlpatterns = [
    path('', views.homeView, name='home'),
	path('game/', views.gameView, name='game'),

	path('game/pong/', pong.pongModeView, name='pong'),
    path('game/pong/tournament/', pong.pongTournament, name='pong_tournament'),
	path('game/pong/local/', pong.pongView, name='pong_local'),

	path('game/chess/', chess.chessModeView, name='chess'),
    path('game/chess/local/', chess.chessView, name='chess_local'),
    path('game/chess/ranked/', chess.chessFoundGameView, name='chess_found_game'),
    path('game/chess/ranked/<int:gameID>/', chess.chessGameView, name='chess_game'),
    
    path('profile/', profils.myProfilView, name='myprofile'),
    path('profile/<str:username>/', profils.profilView, name='profile'),
	path('update-profile/', profils.updateProfile, name='update-profile'),
    path('change-password/', profils.password_change, name='password_change'),

    path('register/', users.registrationView, name='register'),
    path('logout/', users.logout_user, name='logout'),

    path('chat/', chat.chatView, name='chat'),
    path('mini_chat/', chat.mini_chat),

	path('send_friend_request/<str:username>/', users.send_friend_request, name='send_friend_request'),
	path('accept_friend_request/<int:requestID>/', users.accept_friend_request, name='accept_friend_request'),
]