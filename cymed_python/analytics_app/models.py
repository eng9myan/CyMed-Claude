import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ExecutiveDashboardConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    user_id = models.UUIDField(unique=True)
    layout_json = models.JSONField(help_text="User's customized dashboard layout")
    default_facility_id = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'analytics_dashboard_configs'

class KpiSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    kpi_name = models.CharField(max_length=100) # e.g. ALOS, Readmission Rate
    facility_id = models.UUIDField(null=True, blank=True)
    value = models.FloatField()
    target_value = models.FloatField(null=True, blank=True)
    snapshot_date = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_kpi_snapshots'
        indexes = [
            models.Index(fields=['kpi_name', 'snapshot_date']),
        ]
