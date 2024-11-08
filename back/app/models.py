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
	profile_picture = models.ImageField(default='imgs/profils/creepy-cat.webp', blank=True, upload_to = 'imgs/profils/')
	friends = models.ManyToManyField("User", blank=True)

	# PONG ATTRIBUTS
	pong_rank = models.IntegerField(default=0)
	pong_games_played = models.IntegerField(default=0)
	pong_winrate = models.IntegerField(default=0)
	pong_max_exchange = models.IntegerField(default=0)

    # online checker to do

class Friend_Request(models.Model):
	from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)

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

class Pong(models.Model):
	ball_x = models.FloatField(default=75)
	ball_y = models.FloatField(default=50)
	ball_dx = models.FloatField(default=0.5)
	ball_dy = models.FloatField(default=0.5)
	paddle1_y = models.FloatField(default=50)
	paddle2_y = models.FloatField(default=50)

class Game(models.Model):
	player1 = models.ForeignKey(User, related_name='player1', on_delete=models.CASCADE)
	player2 = models.ForeignKey(User, related_name='player2', on_delete=models.CASCADE, null=True, blank=True)
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	arena_width = models.FloatField(default=720)
	arena_height = models.FloatField(default=480)
	status = models.CharField(max_length=20, default='waiting')
	gametype = models.CharField(max_length=5, default='PONG')
	winner = models.ForeignKey(User, related_name='winner', on_delete=models.CASCADE, null=True, blank=True)
	pong = models.ForeignKey('Pong', on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		player2_name = self.player2.username if self.player2 else "No Opponent"
		return f"Game {self.id} - {self.player1.username} vs {player2_name}"
