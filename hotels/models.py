from django.db import models

from users.models import User


class RoomType(models.TextChoices):
    SINGLE = 'SINGLE'
    DOUBLE = 'DOUBLE'
    VIP = 'VIP'
    SUITE = 'SUITE'
    

class RoomStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE'
    RESERVED = 'RESERVED'
    
    
class Hotel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    address = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    latitude = models.FloatField()
    longitude = models.FloatField()
    rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="hotels_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="hotels_updated")

    def __str__(self):
        return self.name
    
    
class Room(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="rooms")
    room_number = models.CharField(max_length=20)
    type = models.CharField(max_length=20, choices=RoomType.choices)
    price_per_night = models.FloatField()
    status = models.CharField(max_length=20, choices=RoomStatus.choices)
    description = models.TextField()

    def __str__(self):
        return f"{self.hotel.name} - {self.room_number}"
    

class HotelImage(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="images")
    url = models.CharField(max_length=255)
    is_cover = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.url