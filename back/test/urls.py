from django.conf.urls import handler404
from django.urls import path
from . import views
from .views import render_spa
from .views import get_profile_info
from .views import get_profile_info_json
from .views import custom_404

handler404 = custom_404

urlpatterns = [
    path('', views.homeView, name='home'),
	path('404/', views.render_spa, name='not_found'),
    path('game/', views.gameView, name='game'),
    path('chat/', views.render_spa, name='chat'),
    path('register/', views.registrationView, name='register'),
    path('profile/<int:user_id>/', views.profilView, name='profile'),
    # path('profile/<int:user_id>/', views.get_profile_info, name='profile'),
    # path('api/profile/<int:user_id>/', views.get_profile_info_json, name='profile_api'),
]