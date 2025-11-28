from django.db import models
from django.contrib.auth.models import AbstractUser


class RoleEnum(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    SUPER_ADMIN = "SUPER_ADMIN", 'Super Admin'
    CLIENT = "CLIENT", 'Client'
    
    
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=RoleEnum.choices, default=RoleEnum.CLIENT)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    hotel = models.ForeignKey('hotels.Hotel', on_delete=models.SET_NULL, null=True, blank=True, help_text="Hôtel associé pour les administrateurs")
    
    def __str__(self):
        return f"{self.username} ({self.role})"