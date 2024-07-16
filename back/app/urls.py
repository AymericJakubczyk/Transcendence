from django.conf.urls import handler404
from django.urls import path
from . import views
from .views import custom_404

handler404 = custom_404

urlpatterns = [
    path('', views.homeView, name='home'),
    path('game/', views.gameView, name='game'),
    path('register/', views.registrationView, name='register'),
    path('profile/', views.myProfilView, name='myprofile'),
    path('profile/<int:user_id>/', views.profilView, name='profile'),
    path('logout/', views.logout_user, name='logout'),
    path('chat/', views.chatView, name='chat'),
]