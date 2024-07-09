from django.contrib import admin
from .models import Member, User

# Register your models here.

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'pseudo', 'first_name', 'second_name')

admin.site.register(User)