from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Q

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
	profile_picture = models.ImageField(default='imgs/profils/creepy-cat.webp', blank=True, upload_to = 'imgs/profils/')
	friends = models.ManyToManyField("User", blank=True)

	# PONG ATTRIBUTS
	pong_rank = models.IntegerField(default=0)
	pong_games_played = models.IntegerField(default=0)
	pong_winrate = models.IntegerField(default=0)
	pong_max_exchange = models.IntegerField(default=0)

	class State(models.TextChoices):
		ONLINE = 'ON'
		OFFLINE = 'OFF'
		INGAME = 'ING'
    # online checker to do
	state = models.CharField(max_length=3, choices=State.choices, default=State.OFFLINE)

class Friend_Request(models.Model):
	from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)

class Discussion(models.Model):
	user1 = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user1')
	user2 = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user2')
	last_activity = models.DateTimeField(auto_now=True)
	
	def get_other_username(self, name):
		if self.user1.username == name:
			return self.user2.username
		else :
			return self.user1.username

	def get_last_message(self):
		last_message = Message.objects.filter(Q(discussion=self)).last()
		if (last_message):
			return (last_message)
		return None

class Message(models.Model):
	discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE)
	sender = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
	message = models.CharField(max_length = 200)
	read = models.BooleanField(default=False)