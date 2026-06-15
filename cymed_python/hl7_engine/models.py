import uuid
from django.db import models

class Hl7MessageLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message_id = models.CharField(max_length=255, null=True, blank=True)
    facility_id = models.UUIDField(null=True, blank=True)
    message_type = models.CharField(max_length=50)
    trigger_event = models.CharField(max_length=50, null=True, blank=True)
    direction = models.CharField(max_length=50)
    source_system = models.CharField(max_length=100, null=True, blank=True)
    destination_system = models.CharField(max_length=100, null=True, blank=True)
    raw_message = models.TextField()
    processing_status = models.CharField(max_length=50)
    error_message = models.TextField(null=True, blank=True)
    patient_id = models.UUIDField(null=True, blank=True)
    message_datetime = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hl7_messages'

    def __str__(self):
        return f"{self.message_type} - {self.processing_status}"
