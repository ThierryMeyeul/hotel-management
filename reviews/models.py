from django.db import models
from django.conf import settings
from hotels.models import Hotel

User = settings.AUTH_USER_MODEL


class Review(models.Model):
    
    class RatingChoices(models.IntegerChoices):
        ONE = 1, '1 - Very Poor'
        TWO = 2, '2 - Poor'
        THREE = 3, '3 - Average'
        FOUR = 4, '4 - Good'
        FIVE = 5, '5 - Excellent'
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reservation = models.ForeignKey(
        'reservations.Reservation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='review'
    )
    rating = models.IntegerField(choices=RatingChoices.choices)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'hotel')
        ordering = ['-created_at']

    def __str__(self):
        return f'Review by {self.user} for {self.hotel} - Rating: {self.rating}'