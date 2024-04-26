from django.urls import path
from . import views

urlpatterns = [
    path('', views.test, name='test'),
    path('game/', views.test, name='test'),
    path('chat/', views.test, name='test'),
    path('profile/', views.test, name='test'),
]