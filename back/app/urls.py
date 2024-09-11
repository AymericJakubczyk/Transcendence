from django.conf.urls import handler404
from django.urls import path, include
from . import views
from .views import custom_404, GameViewSet
from django.contrib.auth.views import PasswordChangeView

#API
from rest_framework import routers

router = routers.SimpleRouter()
router.register('Game', GameViewSet, basename='Game')


handler404 = custom_404

urlpatterns = [
    path('', views.homeView, name='home'),
    path('game/', views.gameView, name='game'),
    path('register/', views.registrationView, name='register'),
    path('profile/', views.myProfilView, name='myprofile'),
    path('profile/<str:username>/', views.profilView, name='profile'),
	path('update-profile/', views.updateProfile, name='update-profile'),
    path('logout/', views.logout_user, name='logout'),
    path('chat/', views.chatView, name='chat'),
    path('change-password/', views.password_change, name='password_change'),

	path('send_friend_request/<str:username>/', views.send_friend_request, name='send_friend_request'),
	path('accept_friend_request/<int:requestID>/', views.accept_friend_request, name='accept_friend_request'),
    
    # API URLS
    path('api-auth/', include('rest_framework.urls')),
    path('initialize-game/', views.initialize_game, name='initialize-game'),

]