import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class PatientSurvey(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    encounter_id = models.UUIDField(null=True, blank=True)
    survey_type = models.CharField(max_length=100) # e.g. Post-Discharge, Clinic Visit
    nps_score = models.IntegerField(null=True, blank=True)
    responses = models.JSONField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exp_surveys'

class PatientComplaint(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    department = models.CharField(max_length=100)
    complaint_text = models.TextField()
    status = models.CharField(max_length=50) # OPEN, INVESTIGATING, RESOLVED
    resolution_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'exp_complaints'
