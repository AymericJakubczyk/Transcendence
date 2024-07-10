from django.db import models
from django.contrib.auth.models import AbstractUser

# ---- USER HERITE DE TOUT CA ----
# id
# password
# last_login
# is_superuser
# username
# first_name
# last_name
# email
# is_staff
# is_active
# date_joined
# groups
# user_permissions

class User(AbstractUser):
	profile_picture = models.ImageField(upload_to = 'profile_pics' , verbose_name='Photo de profil', default='static/srcs/creepy-cat.webp')
	class Pong:
		rank = models.IntegerField(default=0)
		games_played = models.IntegerField(default=0)
		winrate = models.IntegerField(default=0)
		max_exchange = models.IntegerField(default=0)