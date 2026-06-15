import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class CareCase(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    case_manager_id = models.UUIDField()
    primary_diagnosis = models.CharField(max_length=200)
    risk_level = models.CharField(max_length=50) # LOW, MEDIUM, HIGH, CRITICAL
    status = models.CharField(max_length=50, default='ACTIVE') # ACTIVE, CLOSED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'care_cases'

class DischargePlan(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    target_discharge_date = models.DateTimeField(null=True, blank=True)
    destination = models.CharField(max_length=100) # HOME, SNF, REHAB
    readmission_risk_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=50, default='PLANNING')

    class Meta:
        db_table = 'care_discharge_plans'
