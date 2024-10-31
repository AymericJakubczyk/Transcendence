from django.shortcuts import render
from django.http import HttpResponse

def displayMatch(request):
	# Logic to retrieve match data goes here
	match_data = {
		'player1': '',
		'player2': '',
		'score1': NULL,
		'score2': NULL,
	}
	return JSONField(match_data)