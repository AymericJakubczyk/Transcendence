from django.db import models

# Create your models here.

class userTest(models.Model):
	pseudo = models.CharField(max_length=100) 
	first_name = models.CharField(max_length=100)
	second_name = models.CharField(max_length=100)