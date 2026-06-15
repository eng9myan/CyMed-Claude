import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    license_plate = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=50, default='Ambulance')
    status = models.CharField(max_length=50, default='Available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_fleet_vehicles'

class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    driver_id = models.UUIDField(db_index=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    route_details = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default='In Progress')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_fleet_trips'
