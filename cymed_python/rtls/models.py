"""Real-Time Location System (RTLS) — staff, patient, and asset tracking."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class RTLSZone(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    facility_id = models.UUIDField(db_index=True, null=True, blank=True)
    name         = models.CharField(max_length=100)
    zone_type    = models.CharField(max_length=30, choices=[
        ("ward","Ward"),("icu","ICU"),("or","Operating Room"),("er","Emergency"),
        ("corridor","Corridor"),("exit","Exit"),("restricted","Restricted Area"),
    ])
    floor        = models.IntegerField(default=1)
    capacity     = models.IntegerField(null=True, blank=True)
    active       = models.BooleanField(default=True)

    class Meta:
        db_table = "rtls_zones"


class RTLSTag(models.Model):
    TAG_TYPES = [("patient","Patient"),("staff","Staff"),("asset","Asset/Equipment")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    tag_id       = models.CharField(max_length=50, unique=True)
    tag_type     = models.CharField(max_length=20, choices=TAG_TYPES)
    entity_id    = models.UUIDField(db_index=True, help_text="patient_id / staff_id / asset_id")
    entity_name  = models.CharField(max_length=255, blank=True)
    active       = models.BooleanField(default=True)
    battery_pct  = models.IntegerField(null=True, blank=True)
    last_seen    = models.DateTimeField(null=True, blank=True)
    current_zone = models.ForeignKey(RTLSZone, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = "rtls_tags"


class RTLSLocationHistory(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    tag          = models.ForeignKey(RTLSTag, on_delete=models.CASCADE, related_name="history")
    zone         = models.ForeignKey(RTLSZone, on_delete=models.CASCADE)
    entered_at   = models.DateTimeField(db_index=True)
    exited_at    = models.DateTimeField(null=True, blank=True)
    duration_sec = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "rtls_location_history"
        indexes  = [models.Index(fields=["tag", "entered_at"])]


class WanderAlert(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_tag  = models.ForeignKey(RTLSTag, on_delete=models.CASCADE)
    triggered_at = models.DateTimeField(auto_now_add=True)
    zone         = models.ForeignKey(RTLSZone, on_delete=models.CASCADE)
    acknowledged = models.BooleanField(default=False)
    ack_by       = models.UUIDField(null=True, blank=True)
    ack_at       = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "rtls_wander_alerts"
