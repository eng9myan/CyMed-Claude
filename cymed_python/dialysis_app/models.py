import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class DialysisSession(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    access_type = models.CharField(max_length=100, default='UNKNOWN') # AV Fistula, Central Line
    machine_id = models.CharField(max_length=100, null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    pre_weight = models.FloatField(null=True, blank=True)
    post_weight = models.FloatField(null=True, blank=True)
    blood_flow_rate = models.IntegerField(null=True, blank=True)
    dialysate_flow_rate = models.IntegerField(null=True, blank=True)
    ultrafiltration_volume = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='SCHEDULED') # SCHEDULED, IN_PROGRESS, COMPLETED
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dialysis_app_dialysissessions'
