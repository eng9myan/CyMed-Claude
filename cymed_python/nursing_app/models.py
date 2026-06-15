"""Nursing Station models — vital signs, MAR, nursing notes, care plans."""
import uuid6
from django.db import models


def gen_uuid(): return uuid6.uuid7()


class VitalSigns(models.Model):
    id              = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id    = models.UUIDField(db_index=True)
    recorded_by     = models.UUIDField()
    recorded_at     = models.DateTimeField(db_index=True)
    bp_systolic     = models.IntegerField(null=True, blank=True)
    bp_diastolic    = models.IntegerField(null=True, blank=True)
    heart_rate      = models.IntegerField(null=True, blank=True)
    respiratory_rate= models.IntegerField(null=True, blank=True)
    temperature_c   = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    spo2_pct        = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_kg       = models.DecimalField(max_digits=7, decimal_places=3, null=True, blank=True)
    height_cm       = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    pain_score      = models.IntegerField(null=True, blank=True)
    gcs             = models.IntegerField(null=True, blank=True)
    blood_glucose   = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_critical     = models.BooleanField(default=False)
    critical_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "vital_signs"
        indexes  = [
            models.Index(fields=["patient_id", "recorded_at"]),
            models.Index(fields=["encounter_id", "recorded_at"]),
        ]

    @property
    def bmi(self):
        if self.weight_kg and self.height_cm and self.height_cm > 0:
            h_m = float(self.height_cm) / 100
            return round(float(self.weight_kg) / (h_m ** 2), 1)
        return None

    @property
    def news2_score(self) -> int:
        """National Early Warning Score 2."""
        score = 0
        if self.respiratory_rate:
            rr = self.respiratory_rate
            if rr <= 8 or rr >= 25: score += 3
            elif 21 <= rr <= 24: score += 2
            elif 9 <= rr <= 11: score += 1
        if self.spo2_pct:
            s = float(self.spo2_pct)
            if s <= 91: score += 3
            elif s <= 93: score += 2
            elif s <= 95: score += 1
        if self.bp_systolic:
            sbp = self.bp_systolic
            if sbp <= 90 or sbp >= 220: score += 3
            elif sbp <= 100: score += 2
            elif sbp <= 110: score += 1
        if self.heart_rate:
            hr = self.heart_rate
            if hr <= 40 or hr >= 131: score += 3
            elif hr >= 111: score += 2
            elif (41 <= hr <= 50) or (91 <= hr <= 110): score += 1
        if self.temperature_c:
            t = float(self.temperature_c)
            if t <= 35.0: score += 3
            elif t >= 39.1: score += 2
            elif t >= 38.1 or t <= 36.0: score += 1
        return score


class NursingNote(models.Model):
    NOTE_TYPES = [
        ("admission","Admission Assessment"), ("routine","Routine Note"),
        ("shift","Shift Handover"), ("procedure","Procedure Note"),
        ("response","Response to Treatment"), ("discharge","Discharge Teaching"),
        ("fall_risk","Fall Risk Assessment"), ("skin","Skin/Wound Assessment"),
    ]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id = models.UUIDField(db_index=True)
    nurse_id     = models.UUIDField()
    note_type    = models.CharField(max_length=20, choices=NOTE_TYPES, default="routine")
    content      = models.TextField()
    signed       = models.BooleanField(default=False)
    signed_at    = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "nursing_notes"


class MedicationAdministration(models.Model):
    STATUS = [("given","Given"),("held","Held"),("refused","Patient Refused"),("not_available","Not Available")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id = models.UUIDField(db_index=True)
    order_id     = models.UUIDField(db_index=True)
    medication   = models.CharField(max_length=200)
    dose         = models.CharField(max_length=50)
    route        = models.CharField(max_length=30)
    site         = models.CharField(max_length=50, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS, default="given")
    administered_by = models.UUIDField()
    administered_at = models.DateTimeField(db_index=True)
    notes        = models.TextField(blank=True)

    class Meta:
        db_table = "medication_administration_records"


class CarePlan(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id = models.UUIDField(db_index=True)
    created_by   = models.UUIDField()
    goals        = models.JSONField(default=list)
    interventions= models.JSONField(default=list)
    active       = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "care_plans"


class FallRiskAssessment(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id = models.UUIDField(db_index=True)
    assessed_by  = models.UUIDField()
    fall_history = models.BooleanField(default=False)
    secondary_diagnosis = models.BooleanField(default=False)
    ambulatory_aid = models.CharField(max_length=30, default="none")
    iv_access    = models.BooleanField(default=False)
    gait         = models.CharField(max_length=20, default="normal")
    mental_status= models.CharField(max_length=20, default="oriented")
    morse_score  = models.IntegerField(default=0)
    risk_level   = models.CharField(max_length=20, default="low")
    interventions= models.JSONField(default=list)
    assessed_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fall_risk_assessments"

# Compatibility alias for legacy migrations
import uuid6 as _uuid6
def generate_uuidv7(): return _uuid6.uuid7()
