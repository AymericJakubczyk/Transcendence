from django.conf.urls import handler404
from django.urls import path
from . import views
from .views import render_spa
from .views import get_profile_info
from .views import custom_404

handler404 = custom_404

urlpatterns = [
    path('', views.register_user, name='test'),
	path('404/', views.render_spa, name='test'),
    path('game/', views.render_spa, name='test'),
    path('chat/', views.render_spa, name='test'),
    path('profile/<int:user_id>/', views.get_profile_info, name='test'),
]