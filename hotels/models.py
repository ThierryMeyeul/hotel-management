from django.db import models
from django.conf import settings
from django.contrib.gis.geos import Point
from django.contrib.gis.db import models as gis_models


User = settings.AUTH_USER_MODEL

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location = gis_models.PointField(geography=True, srid=4326, blank=True, null=True)

    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_hotels', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.latitude and self.longitude:
            self.location = Point(float(self.longitude), float(self.latitude), srid=4326)
        super().save(*args, **kwargs)
    
    
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