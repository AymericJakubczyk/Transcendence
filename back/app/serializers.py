from rest_framework.serializers import ModelSerializer

from app.models import Game

class GameSerializer(ModelSerializer):

	class Meta:
		model = Game
		fields = '__all__'