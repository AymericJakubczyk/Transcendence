from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
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
	tournament_id = models.IntegerField(default=-1)

	# PONG ATTRIBUTS
	pong_rank = models.IntegerField(default=700)
	pong_games_played = models.IntegerField(default=0)
	pong_winrate = models.IntegerField(default=0)
	pong_max_exchange = models.IntegerField(default=0)

	class State(models.TextChoices):
		ONLINE = 'ON'
		OFFLINE = 'OFF'
		INGAME = 'ING'
    # online checker to do
	state = models.CharField(max_length=3, choices=State.choices, default=State.OFFLINE)

class Invite(models.Model):
	from_user = models.ForeignKey(User, related_name='from_user_invite', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='to_user_invite', on_delete=models.CASCADE)
	class GameType(models.TextChoices):
		PONG = 'PONG'
		CHESS = 'CHESS'
	game_type = models.CharField(max_length=5, choices=GameType.choices)

class Friend_Request(models.Model):
	from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)

class Tournament(models.Model):
	name = models.CharField(max_length = 25, default='Unamed Tournament')
	host_user = models.ForeignKey(User, related_name='host_user', on_delete=models.CASCADE)
	participants = models.ManyToManyField("User", blank=True)
	max_users = models.IntegerField(default=8)
	winner : 'User' = models.ForeignKey(User, related_name='winner', on_delete=models.SET_NULL, null=True, blank=True)
	class GameState(models.TextChoices):
		PONG = 'PONG'
		CHESS = 'CHESS'
	game_played = models.CharField(max_length=5, choices=GameState.choices, default=GameState.PONG)
	
	def saveTournament(self, *args):
		self.save()
		super().save(*args)


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
	message = models.CharField(max_length = 420)
	read = models.BooleanField(default=False)

class Game_Chess(models.Model):
	white_player = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name='white_player')
	black_player = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name='black_player')
	turn_white = models.BooleanField(default=True)

	def board_default():
		return {'piece': None, 'color': None}

	board = ArrayField(
        ArrayField(
            models.JSONField(null=True, blank=True, default=board_default),
            size=8
        ),
        size=8
    )
	over = models.BooleanField(default=False)
	winner = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='chesswinner')

class Game_Pong(models.Model):
	player1 = models.ForeignKey(User, related_name='player1', on_delete=models.CASCADE)
	player1_score = models.IntegerField(default=0)
	player2 = models.ForeignKey(User, related_name='player2', on_delete=models.CASCADE, null=True, blank=True)
	player2_score = models.IntegerField(default=0)
	player1_rank = models.IntegerField(default=0)
	player2_rank = models.IntegerField(default=0)
	player1_rank_win = models.IntegerField(default=0)
	player2_rank_win = models.IntegerField(default=0)
	status = models.CharField(max_length=20, default='waiting')
	gametype = models.CharField(max_length=5)
	winner = models.ForeignKey(User, related_name='pongwinner', on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	tournament = models.BooleanField(default=False)

	def get_other_username(self, name):
		if self.player2.username == name:
			return self.player1.username
		else :
			return self.player2.username

	def __str__(self):
		player2_name = self.player2.username if self.player2 else "No Opponent"
		return f"Game {self.id} - {self.player1.username} vs {player2_name}"

#WEB3 models

class TournamentMatch(models.Model):
	roundNumber = models.ForeignKey('TournamentRound', related_name='roundNb', on_delete=models.CASCADE)
	tour = models.ForeignKey('Tournament', related_name='round', on_delete=models.CASCADE)
	state = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('playing', 'Playing'), ('finished', 'Finished')], default='pending')
	identifier = models.IntegerField()
	winner : 'User' = models.ForeignKey(User, related_name='matchWinner', on_delete=models.SET_NULL, null=True, blank=True)
	
	def __str__(self):
		return f"{self.tour.name} + {self.state} + {self.date}"

class TournamentRound(models.Model):
	tournament = models.ForeignKey('Tournament', related_name='tournamentId', on_delete=models.CASCADE)
	roundNumber = models.IntegerField()
	matches = models.ManyToManyField('TournamentMatch', blank=True)
	date = models.DateTimeField(null=True, blank=True)
	
	class Meta:
		unique_together = ('tournament', 'roundNumber')

	def __str__(self):
		return f"{self.tour.name} + {self.roundNumber}"
	
class TournamentPlayer(models.Model):
	user: 'User' = models.ForeignKey(User, related_name='TournamentRegistered' , on_delete=models.CASCADE)
	match = models.ForeignKey('TournamentMatch', on_delete=models.CASCADE, null=True)
	state = models.CharField(max_length=20, choices=[('eliminated', 'Eliminated'), ('playing', 'Playing')], default='eliminated')
	
	class Meta:
		unique_together = ('user', 'match')
	
	def __str__(self):
		return f"{self.user.username}"
	
class Match_Player(models.Model):
	player : 'User' = models.ForeignKey(User, related_name='player', on_delete=models.CASCADE)
	match = models.ForeignKey('TournamentMatch', related_name='match', on_delete=models.CASCADE, null=True, blank=True)
	
	class Meta:
		unique_together = ('player', 'match')
	
	def __str__(self):
		return f"{self.player.username} + {self.match.id}"