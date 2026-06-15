"""Clinical Pathways & Order Sets."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class ClinicalPathway(models.Model):
    id            = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    name          = models.CharField(max_length=255)
    name_ar       = models.CharField(max_length=255, blank=True)
    diagnosis_code= models.CharField(max_length=20, blank=True, help_text="ICD-11 code")
    specialty     = models.CharField(max_length=100, blank=True)
    version       = models.CharField(max_length=20, default="1.0")
    active        = models.BooleanField(default=True)
    expected_los_days = models.IntegerField(null=True, blank=True)
    evidence_grade= models.CharField(max_length=5, blank=True, help_text="A/B/C/D")
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "clinical_pathways"


class PathwayStep(models.Model):
    STEP_TYPES = [("order","Order"),("assessment","Assessment"),("education","Education"),
                  ("nursing","Nursing Action"),("consult","Consult"),("discharge_criteria","Discharge Criteria")]
    id          = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    pathway     = models.ForeignKey(ClinicalPathway, on_delete=models.CASCADE, related_name="steps")
    step_number = models.IntegerField()
    step_type   = models.CharField(max_length=30, choices=STEP_TYPES)
    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    day_offset  = models.IntegerField(default=0, help_text="Day from admission")
    is_mandatory= models.BooleanField(default=True)
    order_detail= models.JSONField(default=dict, help_text="CPOE order details if step_type=order")

    class Meta:
        db_table  = "pathway_steps"
        ordering  = ["pathway", "day_offset", "step_number"]


class PatientPathwayEnrollment(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    pathway      = models.ForeignKey(ClinicalPathway, on_delete=models.CASCADE)
    encounter_id = models.UUIDField()
    enrolled_by  = models.UUIDField()
    enrolled_at  = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    variance_notes = models.TextField(blank=True)

    class Meta:
        db_table = "patient_pathway_enrollments"


class PathwayStepCompletion(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    enrollment   = models.ForeignKey(PatientPathwayEnrollment, on_delete=models.CASCADE, related_name="completions")
    step         = models.ForeignKey(PathwayStep, on_delete=models.CASCADE)
    completed_by = models.UUIDField()
    completed_at = models.DateTimeField(auto_now_add=True)
    variance     = models.BooleanField(default=False)
    variance_reason = models.TextField(blank=True)

    class Meta:
        db_table = "pathway_step_completions"
