"""Palliative Care & Hospice."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class PalliativeCareEnrollment(models.Model):
    LEVEL = [("palliative","Palliative Care"),("hospice","Hospice — Terminal <6 months")]
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    care_level     = models.CharField(max_length=20, choices=LEVEL, default="palliative")
    primary_diagnosis = models.CharField(max_length=20)
    prognosis_months  = models.IntegerField(null=True, blank=True)
    enrolled_by    = models.UUIDField()
    enrolled_at    = models.DateTimeField(auto_now_add=True)
    discharged_at  = models.DateTimeField(null=True, blank=True)
    discharge_reason = models.CharField(max_length=255, blank=True)
    goals_of_care  = models.TextField(blank=True)
    dnr_on_file    = models.BooleanField(default=False)

    class Meta:
        db_table = "palliative_enrollments"


class AdvanceDirective(models.Model):
    DIRECTIVE_TYPES = [
        ("dnr",   "Do Not Resuscitate"),
        ("polst", "POLST / MOLST"),
        ("living_will", "Living Will"),
        ("poa_health",  "Healthcare Power of Attorney"),
    ]
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    directive_type = models.CharField(max_length=20, choices=DIRECTIVE_TYPES)
    document_url   = models.URLField(blank=True)
    witnessed_by   = models.CharField(max_length=255, blank=True)
    signed_at      = models.DateField()
    active         = models.BooleanField(default=True)
    scanned_doc    = models.BinaryField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "advance_directives"


class SymptomAssessment(models.Model):
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    enrollment     = models.ForeignKey(PalliativeCareEnrollment, on_delete=models.CASCADE, related_name="assessments")
    assessed_by    = models.UUIDField()
    pain_score     = models.IntegerField(default=0)  # 0-10
    dyspnea_score  = models.IntegerField(default=0)
    nausea_score   = models.IntegerField(default=0)
    anxiety_score  = models.IntegerField(default=0)
    fatigue_score  = models.IntegerField(default=0)
    notes          = models.TextField(blank=True)
    assessed_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "palliative_symptom_assessments"
