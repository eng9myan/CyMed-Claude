"""
Encounter & Admission models — the core of the Patient Journey.
"""
import uuid6
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


def generate_uuidv7():
    return uuid6.uuid7()


class Encounter(models.Model):
    """
    A single episode of care: ED visit, outpatient consult, inpatient admission, etc.
    Drives the Patient Journey state machine.
    """
    ENCOUNTER_TYPES = [
        ("outpatient",  "Outpatient / Clinic"),
        ("emergency",   "Emergency"),
        ("inpatient",   "Inpatient Admission"),
        ("surgery",     "Surgical"),
        ("virtual",     "Telehealth / Virtual"),
        ("home",        "Home Health"),
    ]

    id                  = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_number    = models.CharField(max_length=30, unique=True, db_index=True)
    patient_id          = models.UUIDField(db_index=True, null=True, blank=True)
    facility_id = models.UUIDField(db_index=True, null=True, blank=True)
    department_id       = models.UUIDField(null=True, blank=True)
    encounter_type      = models.CharField(max_length=20, choices=ENCOUNTER_TYPES, default="outpatient")
    workflow_status     = models.CharField(max_length=30, default="registered", db_index=True)

    # Providers
    attending_provider_id = models.UUIDField(null=True, blank=True)
    referring_provider_id = models.UUIDField(null=True, blank=True)

    # Timestamps
    registered_at       = models.DateTimeField(auto_now_add=True)
    checked_in_at       = models.DateTimeField(null=True, blank=True)
    admitted_at         = models.DateTimeField(null=True, blank=True)
    discharged_at       = models.DateTimeField(null=True, blank=True)
    updated_at          = models.DateTimeField(auto_now=True)

    # Clinical
    chief_complaint     = models.TextField(blank=True)
    triage_level        = models.IntegerField(null=True, blank=True, help_text="1=Immediate 2=Emergent 3=Urgent 4=Less Urgent 5=Non-Urgent")
    primary_diagnosis   = models.CharField(max_length=20, blank=True, help_text="ICD-11 code")
    secondary_diagnoses = models.JSONField(default=list)
    discharge_summary   = models.TextField(blank=True)
    discharge_disposition = models.CharField(max_length=50, blank=True)

    # Insurance
    insurance_id        = models.UUIDField(null=True, blank=True)
    pre_auth_number     = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = "encounters"
        indexes  = [
            models.Index(fields=["patient_id", "workflow_status"]),
            models.Index(fields=["facility_id", "workflow_status"]),
            models.Index(fields=["attending_provider_id"]),
        ]

    def __str__(self):
        return f"Encounter {self.encounter_number} [{self.workflow_status}]"

    def get_available_transitions(self):
        from .workflow import get_available_transitions
        return get_available_transitions(self)

    def transition_to(self, new_state: str, user=None, notes: str = ""):
        from .workflow import transition
        transition(self, new_state, user=user, notes=notes)

    @property
    def length_of_stay_hours(self) -> float | None:
        if self.admitted_at and self.discharged_at:
            delta = self.discharged_at - self.admitted_at
            return round(delta.total_seconds() / 3600, 1)
        return None


class WorkflowEvent(models.Model):
    """Immutable audit log of every state transition."""
    id              = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter       = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name="workflow_events")
    from_state      = models.CharField(max_length=30)
    to_state        = models.CharField(max_length=30)
    transitioned_by = models.UUIDField(null=True, blank=True)
    timestamp       = models.DateTimeField(auto_now_add=True)
    notes           = models.TextField(blank=True)

    class Meta:
        db_table = "encounter_workflow_events"
        ordering = ["timestamp"]


class TriageAssessment(models.Model):
    """Emergency triage assessment (ESI / CTAS)."""
    id              = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter       = models.OneToOneField(Encounter, on_delete=models.CASCADE, related_name="triage")
    triaged_by      = models.UUIDField()
    triage_level    = models.IntegerField(help_text="1-5, 1=Immediate")
    chief_complaint = models.TextField()
    # Vitals at triage
    bp_systolic     = models.IntegerField(null=True, blank=True)
    bp_diastolic    = models.IntegerField(null=True, blank=True)
    heart_rate      = models.IntegerField(null=True, blank=True)
    respiratory_rate= models.IntegerField(null=True, blank=True)
    temperature     = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    spo2            = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    gcs             = models.IntegerField(null=True, blank=True, help_text="Glasgow Coma Scale 3-15")
    pain_score      = models.IntegerField(null=True, blank=True, help_text="0-10")
    weight_kg       = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    allergies       = models.JSONField(default=list)
    notes           = models.TextField(blank=True)
    triaged_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "triage_assessments"


class DischargeOrder(models.Model):
    """Physician discharge order — initiates the discharge planning workflow."""
    DISPOSITION = [
        ("home",            "Home"),
        ("home_with_service","Home with Home Health"),
        ("snf",             "Skilled Nursing Facility"),
        ("rehab",           "Rehabilitation Facility"),
        ("ltac",            "Long-Term Acute Care"),
        ("hospice",         "Hospice"),
        ("transfer",        "Transfer to Another Facility"),
        ("ama",             "Against Medical Advice"),
        ("expired",         "Expired"),
    ]
    id              = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter       = models.OneToOneField(Encounter, on_delete=models.CASCADE, related_name="discharge_order")
    ordered_by      = models.UUIDField()
    disposition     = models.CharField(max_length=30, choices=DISPOSITION)
    discharge_date  = models.DateField()
    discharge_instructions = models.TextField(blank=True)
    follow_up_days  = models.IntegerField(null=True, blank=True)
    follow_up_provider = models.UUIDField(null=True, blank=True)
    medications_reconciled = models.BooleanField(default=False)
    patient_educated= models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "discharge_orders"


# Legacy model kept for FK compatibility
class Admission(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter = models.OneToOneField(Encounter, on_delete=models.CASCADE, null=True, blank=True, related_name="admission")
    patient_id          = models.UUIDField(db_index=True, null=True, blank=True)
    bed_id = models.UUIDField(null=True, blank=True)
    admitted_at = models.DateTimeField(null=True, blank=True)
    discharged_at = models.DateTimeField(null=True, blank=True)
    state = models.CharField(max_length=50, default="admitted")

    class Meta:
        db_table = "clinical_admission"
