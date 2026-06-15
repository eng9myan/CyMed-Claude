import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class InteropMessageLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    message_type = models.CharField(max_length=50) # HL7, FHIR, DICOM
    event_type = models.CharField(max_length=50) # ADT^A01, Patient, ORM
    direction = models.CharField(max_length=20) # INBOUND, OUTBOUND
    source_system = models.CharField(max_length=100)
    target_system = models.CharField(max_length=100)
    raw_payload = models.TextField()
    parsed_payload = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=50) # PROCESSED, ERROR, PENDING
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'interop_message_logs'
