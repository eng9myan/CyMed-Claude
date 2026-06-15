import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class RiskScore(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.CharField(max_length=255)
    model_name = models.CharField(max_length=100) # Readmission, Deterioration
    score = models.FloatField()
    risk_level = models.CharField(max_length=50) # HIGH, MEDIUM, LOW
    factors = models.JSONField(default=dict)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'predictive_risk_scores'

class PredictiveModelRegistry(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255) # e.g. Readmission Risk, Sepsis Risk AI
    version = models.CharField(max_length=50)
    endpoint = models.CharField(max_length=255)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'predictive_models'

class PatientRiskScore(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    model = models.ForeignKey(PredictiveModelRegistry, on_delete=models.CASCADE)
    score_value = models.FloatField()
    risk_category = models.CharField(max_length=50) # LOW, MEDIUM, HIGH
    factors = models.JSONField(help_text="Contributing factors to the score")
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'predictive_patient_scores'
