import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class FhirResourceMapping(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    fhir_resource_type = models.CharField(max_length=100) # e.g. Patient, Encounter
    internal_model = models.CharField(max_length=100) # e.g. patient_app.GlobalPatient
    mapping_schema = models.JSONField(help_text="JSON mapping rules from internal to FHIR standard")
    version = models.CharField(max_length=50) # R4, R5
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fhir_resource_mappings'
        unique_together = ('fhir_resource_type', 'version')

class FhirSyncLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    resource_type = models.CharField(max_length=100)
    internal_id = models.UUIDField()
    sync_status = models.CharField(max_length=50) # SUCCESS, ERROR
    error_message = models.TextField(null=True, blank=True)
    synced_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fhir_sync_logs'
