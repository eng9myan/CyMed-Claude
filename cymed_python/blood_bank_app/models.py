import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class BloodBag(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    donor_id = models.CharField(max_length=255, default='UNKNOWN')
    blood_group = models.CharField(max_length=10, default='UNKNOWN') # A, B, AB, O
    rh_factor = models.CharField(max_length=10, default='UNKNOWN') # POSITIVE, NEGATIVE
    volume_ml = models.IntegerField(default=450)
    donation_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    storage_location = models.CharField(max_length=100, null=True, blank=True)
    crossmatched_patient_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=50, default='AVAILABLE') # AVAILABLE, RESERVED, DISPENSED, DISCARDED
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'blood_bank_app_bloodbags'
