from django.db import models
from django.contrib.auth.models import AbstractUser


class RoleEnum(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    DIRECTOR = 'DIRECTOR', 'Director'
    CLIENT = 'CLIENT', 'Client'


class User(AbstractUser):
    
    role = models.CharField(
        max_length=10,
        choices=RoleEnum.choices,
        default=RoleEnum.CLIENT,
    )
    
    phone_number = models.CharField(
        max_length=20, 
        blank=True, 
        null=True
    )
    
    is_blocked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.role})"