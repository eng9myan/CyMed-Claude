import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class OtCase(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    patient_id = models.UUIDField(null=True, blank=True)
    surgeon_id = models.UUIDField()
    anesthesiologist_id = models.UUIDField(null=True, blank=True)
    procedure_code = models.UUIDField(help_text="Reference to Terminology App Concept (ICD-11/CPT)")
    planned_procedure_name = models.CharField(max_length=255)
    ot_room_id = models.UUIDField(help_text="Reference to SchedulableResource")
    status = models.CharField(max_length=50) # SCHEDULED, PRE_OP, INTRA_OP, POST_OP, CANCELLED
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    pre_op_diagnosis = models.TextField(null=True, blank=True)
    post_op_diagnosis = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'or_cases'

class SurgicalSafetyChecklist(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    case_id = models.UUIDField(help_text="Reference to OtCase")
    phase = models.CharField(max_length=50) # SIGN_IN, TIME_OUT, SIGN_OUT
    completed_by = models.UUIDField()
    completed_at = models.DateTimeField(auto_now_add=True)
    checklist_data = models.JSONField(help_text="Checklist items and their status")
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'or_surgical_safety_checklist'

class AnesthesiaLogs(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    case_id = models.UUIDField(help_text="Reference to OtCase")
    recorded_by = models.UUIDField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    anesthesia_type = models.CharField(max_length=100)
    medications_given = models.JSONField(default=list)
    vitals_snapshot = models.JSONField(default=dict)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'or_anesthesia_logs'

class ProcedureLogs(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    case_id = models.UUIDField(help_text="Reference to OtCase")
    recorded_by = models.UUIDField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    milestone = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    complications = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'or_procedure_logs'
