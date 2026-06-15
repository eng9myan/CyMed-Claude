"""Infection Prevention & Control (IPC)."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class HAIEvent(models.Model):
    """Healthcare-Associated Infection event."""
    HAI_TYPES = [
        ("clabsi",  "CLABSI — Central Line BSI"),
        ("cauti",   "CAUTI — Catheter-Associated UTI"),
        ("vap",     "VAP — Ventilator-Associated Pneumonia"),
        ("ssi",     "SSI — Surgical Site Infection"),
        ("cdiff",   "C. difficile Infection"),
        ("mrsa",    "MRSA Bacteremia"),
        ("other",   "Other HAI"),
    ]
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id   = models.UUIDField(null=True, blank=True)
    hai_type       = models.CharField(max_length=20, choices=HAI_TYPES)
    onset_date     = models.DateField()
    location_id    = models.UUIDField(null=True, blank=True)
    pathogen       = models.CharField(max_length=100, blank=True)
    antibiotic_resistance = models.JSONField(default=list)
    reported_by    = models.UUIDField()
    confirmed      = models.BooleanField(default=False)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ipc_hai_events"


class IsolationOrder(models.Model):
    PRECAUTION_TYPES = [
        ("contact",     "Contact Precautions"),
        ("droplet",     "Droplet Precautions"),
        ("airborne",    "Airborne Precautions"),
        ("contact_enhanced", "Enhanced Contact"),
        ("protective",  "Protective / Reverse Isolation"),
    ]
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    precaution_type= models.CharField(max_length=30, choices=PRECAUTION_TYPES)
    reason         = models.CharField(max_length=255)
    ordered_by     = models.UUIDField()
    ordered_at     = models.DateTimeField(auto_now_add=True)
    discontinued_at= models.DateTimeField(null=True, blank=True)
    active         = models.BooleanField(default=True)

    class Meta:
        db_table = "ipc_isolation_orders"


class HandHygieneAudit(models.Model):
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ward_id        = models.UUIDField()
    auditor_id     = models.UUIDField()
    audit_date     = models.DateField()
    opportunities  = models.IntegerField(default=0)
    compliant      = models.IntegerField(default=0)
    compliance_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ipc_hand_hygiene_audits"
