from django.db import models
from django.contrib.auth.models import AbstractUser

# USER HERITE DE TOUT CA
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

class Discussion(models.Model):
	user1 = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user1')
	user2 = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user2')
	
	def get_other_username(self, name):
		if self.user1.username == name:
			return self.user2.username
		else :
			return self.user1.username


class Message(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    message = models.CharField(max_length = 200)