from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Member(models.Model):
	user_id = models.IntegerField(default=404)
	pseudo = models.CharField(max_length=100) 
	first_name = models.CharField(max_length=100)
	second_name = models.CharField(max_length=100)