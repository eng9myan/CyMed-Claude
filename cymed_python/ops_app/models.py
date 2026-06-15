import uuid6
from django.db import models
from django.conf import settings
from patient_app.models import Patient

def generate_uuidv7():
    return uuid6.uuid7()

class Ward(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    floor = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_wards'

class Bed(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    bed_no = models.CharField(max_length=255)
    room_no = models.CharField(max_length=255)
    bed_type = models.CharField(max_length=255)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_beds'

class Admission(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ops_admissions')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctor_admissions')
    bed = models.ForeignKey(Bed, on_delete=models.SET_NULL, null=True, blank=True, related_name='admissions')
    admitted_at = models.DateTimeField(null=True, blank=True)
    discharged_at = models.DateTimeField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    discharge_summary = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255)
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_admissions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_admissions'

class HospitalAuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    action = models.CharField(max_length=255)
    model_type = models.CharField(max_length=255)
    model_id = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=255, null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_audit_logs'

class PatientMerge(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    primary_patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='primary_merges')
    merged_patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='merged_as_merges')
    reason = models.TextField(null=True, blank=True)
    merged_snapshot = models.JSONField(null=True, blank=True)
    merged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_merges')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_patient_merges'
