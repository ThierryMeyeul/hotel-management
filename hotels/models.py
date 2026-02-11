from django.db import models
from django.conf import settings
from django.contrib.gis.geos import Point
from django.contrib.gis.db import models as gis_models


User = settings.AUTH_USER_MODEL

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    website = models.CharField(max_length=50, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location = gis_models.PointField(geography=True, srid=4326, blank=True, null=True)

    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_hotels', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    def total_favorites(self):
        return self.favorited_by.count()
    
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
        SIMPLE = 'SIMPLE', 'Simple'
        TWIN = "TWIN", 'Twin'
        TRIPLE = "TRIPLE", 'Triple'
        FAMILY = 'FAMILY', 'Family'
        PRESIDENTIAL = 'PRESIDENTIAL', 'Presidential'
    
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=10)
    room_type = models.CharField(
        max_length=20,
        choices=RoleEnum.choices,
        default=RoleEnum.SINGLE,
    )
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    description = models.TextField(null=True, blank=True)
    amenities = models.JSONField(default=list, null=True, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    size = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"Room {self.room_number} at {self.hotel.name}"
    
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'hotel')

    def __str__(self):
        return f"{self.user.username} favorites {self.hotel.name}"