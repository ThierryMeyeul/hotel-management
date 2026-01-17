from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
import math

from ..models import Hotel


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the Haversine distance between two points on the Earth specified in decimal degrees.
    Returns distance in kilometers.
    """
    R = 6371.0  # Radius of the Earth in kilometers

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def get_nearby_hotels(latitude, longitude, radius_km=50, max_results=20):
    """
    Annotate the queryset of hotels with distance from the given latitude and longitude,
    and filter by the specified radius in kilometers.
    """
    
    user_location = Point(float(longitude), float(latitude), srid=4326)
    queryset = Hotel.objects.filter(
        location__distance_lte=(user_location, D(km=radius_km)),
        is_active=True
    ).annotate(
        distance_km=Distance('location', user_location) / 1000  # Convert to kilometers
    ).order_by('distance_km')[:max_results]
    
    return queryset


def get_hotels_with_distance(latitude, longitude, hotel_queryset):
    """
    Annotate all hotels with distance from the given latitude and longitude.
    """
    
    hotels_list = []
    for hotel in hotel_queryset:
        distance = calculate_distance(latitude, longitude, hotel.latitude, hotel.longitude)
        
        hotel_copy = hotel
        hotel_copy.distance_km = distance
        hotels_list.append(hotel_copy)
        
    hotels_list.sort(key=lambda x: x.distance_km)
    return hotels_list