"""Home Health & Remote Patient Monitoring."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class HomeHealthEpisode(models.Model):
    STATUS = [("active","Active"),("completed","Completed"),("discharged","Discharged"),("on_hold","On Hold")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    referring_provider = models.UUIDField(null=True, blank=True)
    start_date   = models.DateField()
    end_date     = models.DateField(null=True, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS, default="active")
    primary_diagnosis = models.CharField(max_length=20, blank=True)
    goals        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "home_health_episodes"


class HomeVisit(models.Model):
    VISIT_TYPES = [("nursing","Nursing"),("pt","Physical Therapy"),("ot","Occupational Therapy"),
                   ("speech","Speech Therapy"),("aide","Home Health Aide"),("social","Social Work")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    episode      = models.ForeignKey(HomeHealthEpisode, on_delete=models.CASCADE, related_name="visits")
    visit_type   = models.CharField(max_length=20, choices=VISIT_TYPES)
    clinician_id = models.UUIDField()
    scheduled_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    gps_lat      = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_lon      = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    notes        = models.TextField(blank=True)
    vital_signs  = models.JSONField(default=dict)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "home_health_visits"


class RPMDevice(models.Model):
    DEVICE_TYPES = [("bp_cuff","BP Cuff"),("pulse_ox","Pulse Oximeter"),("glucometer","Glucometer"),
                    ("weight_scale","Weight Scale"),("thermometer","Thermometer"),("ecg","ECG Patch")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    device_type  = models.CharField(max_length=30, choices=DEVICE_TYPES)
    device_id    = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100, blank=True)
    active       = models.BooleanField(default=True)
    enrolled_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rpm_devices"


class RPMReading(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    device       = models.ForeignKey(RPMDevice, on_delete=models.CASCADE, related_name="readings")
    reading_data = models.JSONField()
    recorded_at  = models.DateTimeField(db_index=True)
    is_alert     = models.BooleanField(default=False)
    alert_reason = models.CharField(max_length=255, blank=True)
    reviewed     = models.BooleanField(default=False)

    class Meta:
        db_table = "rpm_readings"
        indexes  = [models.Index(fields=["device", "recorded_at"])]
