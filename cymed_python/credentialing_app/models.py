import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ProviderCredential(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    provider_id = models.UUIDField(help_text="Reference to auth_app User/Employee")
    credential_type = models.CharField(max_length=100) # MEDICAL_LICENSE, DEA, BOARD_CERTIFICATION
    issuing_authority = models.CharField(max_length=255)
    credential_number = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiration_date = models.DateField()
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=50) # ACTIVE, EXPIRED, SUSPENDED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cred_provider_credentials'

class Privilege(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    provider_id = models.UUIDField()
    facility_id = models.UUIDField(null=True, blank=True)
    privilege_name = models.CharField(max_length=255) # e.g. Admit Patients, Perform CABG
    status = models.CharField(max_length=50) # GRANTED, PENDING, REVOKED
    granted_date = models.DateField()
    expiration_date = models.DateField()
    approved_by = models.UUIDField()

    class Meta:
        db_table = 'cred_privileges'
