import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class SchedulableResource(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    resource_type = models.CharField(max_length=100) # PHYSICIAN, NURSE, ROOM, EQUIPMENT
    resource_id = models.UUIDField() # ID of the actual resource from other domains
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'schedulable_resources'

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    primary_resource = models.ForeignKey(SchedulableResource, on_delete=models.CASCADE, related_name='appointments')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=50) # SCHEDULED, ARRIVED, NO_SHOW, CANCELLED, COMPLETED
    appointment_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['patient_id']),
        ]
