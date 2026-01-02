from django.db import models
from django.conf import settings


User = settings.AUTH_USER_MODEL

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_hotels', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    
class HotelImage(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='hotel_images/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    is_cover = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.hotel.name}"
    
    
class Room(models.Model):
    
    class RoleEnum(models.TextChoices):
        SINGLE = 'SINGLE', 'Single'
        DOUBLE = 'DOUBLE', 'Double'
        SUITE = 'SUITE', 'Suite'
        VIP = 'VIP', 'VIP'
    
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=10)
    room_type = models.CharField(
        max_length=10,
        choices=RoleEnum.choices,
        default=RoleEnum.SINGLE,
    )
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Room {self.room_number} at {self.hotel.name}"