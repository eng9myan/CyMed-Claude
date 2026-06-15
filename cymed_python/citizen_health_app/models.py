import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class CitizenAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    national_id = models.CharField(max_length=50, unique=True)
    linked_patient_ids = models.JSONField(default=list) # Cross-facility EMPI links
    consent_for_research = models.BooleanField(default=False)

    class Meta:
        db_table = 'citizen_accounts'
