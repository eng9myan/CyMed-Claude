import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ClinicalGuideline(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    title = models.CharField(max_length=255)
    specialty = models.CharField(max_length=100)
    content = models.TextField()
    source_organization = models.CharField(max_length=255) # e.g. WHO, AHA, Local
    version = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'know_clinical_guidelines'

class StandardOperatingProcedure(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    title = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'know_sops'
