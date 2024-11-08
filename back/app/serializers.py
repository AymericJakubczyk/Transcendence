from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from app.models import Game, Pong
from django.contrib.auth.models import User

class PongSerializer(ModelSerializer):
    class Meta:
        model = Pong
        fields = '__all__'

class GameSerializer(ModelSerializer):
    player1 = serializers.CharField(source='player1.username')
    player2 = serializers.CharField(source='player2.username', required=False, allow_null=True)
    pong = PongSerializer()

    class Meta:
        model = Game
        fields = '__all__'

class GameStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['status', 'winner']