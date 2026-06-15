import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class SentinelEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField(null=True, blank=True)
    patient_id = models.UUIDField(null=True, blank=True)
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    reported_by = models.UUIDField()
    reported_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='UNDER_INVESTIGATION') # UNDER_INVESTIGATION, RCA_COMPLETE, CLOSED
    root_cause_analysis = models.TextField(null=True, blank=True)
    action_plan = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'gov_sentinel_events'

class MortalityReview(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    date_of_death = models.DateTimeField()
    reviewer_id = models.UUIDField()
    findings = models.TextField()
    is_preventable = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='PENDING') # PENDING, REVIEWED

    class Meta:
        db_table = 'gov_mortality_reviews'

class QualityIndicator(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    metric_name = models.CharField(max_length=100) # e.g. CLABSI_RATE, READMISSION_RATE
    target_value = models.DecimalField(max_digits=10, decimal_places=4)
    current_value = models.DecimalField(max_digits=10, decimal_places=4)
    measured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'gov_quality_indicators'