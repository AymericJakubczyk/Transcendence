from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from app.models import Game, Pong
from django.contrib.auth.models import User

class GameSerializer(ModelSerializer):
    player1 = serializers.CharField(source='player1.username')
    player2 = serializers.CharField(source='player2.username')
    pong = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'gametype', 'player1', 'player2', 'pong']

    def get_pong(self, instance):
        queryset = Pong.objects.all()
        serializer = PongSerializer(queryset, many=True)
        return serializer.data

class PongSerializer(ModelSerializer):
    class Meta:
        model = Pong
        fields = '__all__'
