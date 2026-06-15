"""Occupational Health & Employee Health Services."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class EmployeeHealthRecord(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    employee_id  = models.UUIDField(db_index=True, unique=True)
    blood_type   = models.CharField(max_length=5, blank=True)
    allergies    = models.JSONField(default=list)
    chronic_conditions = models.JSONField(default=list)
    restrictions = models.TextField(blank=True)
    fit_for_duty = models.BooleanField(default=True)
    last_health_check = models.DateField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "occ_employee_health_records"


class OccHealthVaccination(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    employee_id  = models.UUIDField(db_index=True)
    vaccine      = models.CharField(max_length=100)
    dose_number  = models.IntegerField(default=1)
    given_at     = models.DateField()
    expiry_date  = models.DateField(null=True, blank=True)
    lot_number   = models.CharField(max_length=50, blank=True)
    given_by     = models.UUIDField()
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "occ_vaccinations"


class WorkplaceIncident(models.Model):
    INCIDENT_TYPES = [
        ("needlestick",    "Needlestick / Sharps Injury"),
        ("blood_exposure",  "Blood / Body Fluid Exposure"),
        ("fall",           "Slip / Trip / Fall"),
        ("ergonomic",      "Ergonomic / Musculoskeletal"),
        ("chemical",       "Chemical Exposure"),
        ("assault",        "Assault / Violence"),
        ("other",          "Other"),
    ]
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    employee_id    = models.UUIDField(db_index=True)
    incident_type  = models.CharField(max_length=30, choices=INCIDENT_TYPES)
    incident_date  = models.DateTimeField()
    location       = models.CharField(max_length=255)
    description    = models.TextField()
    source_patient_id = models.UUIDField(null=True, blank=True, help_text="For exposure incidents")
    injuries       = models.TextField(blank=True)
    first_aid_given= models.BooleanField(default=False)
    reported_by    = models.UUIDField()
    osha_recordable= models.BooleanField(default=False)
    days_lost      = models.IntegerField(default=0)
    follow_up_required = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "occ_workplace_incidents"


class FitForDutyAssessment(models.Model):
    OUTCOME = [("fit","Fit for Full Duty"),("restricted","Fit with Restrictions"),
               ("not_fit","Not Fit for Duty"),("pending","Pending Results")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    employee_id  = models.UUIDField(db_index=True)
    assessed_by  = models.UUIDField()
    assessment_date = models.DateField()
    reason       = models.CharField(max_length=255)
    outcome      = models.CharField(max_length=20, choices=OUTCOME, default="pending")
    restrictions = models.TextField(blank=True)
    return_date  = models.DateField(null=True, blank=True)
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "occ_fit_for_duty_assessments"
