"""Executive Dashboard — KPIs, scorecards, AI briefing snapshots."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class KPISnapshot(models.Model):
    """Point-in-time snapshot of facility KPIs for historical trending."""
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    facility_id = models.UUIDField(db_index=True, null=True, blank=True)
    snapshot_date= models.DateField(db_index=True)
    # Operational
    total_admissions    = models.IntegerField(default=0)
    total_discharges    = models.IntegerField(default=0)
    avg_los_days        = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    bed_occupancy_pct   = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    er_wait_time_min    = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    # Clinical quality
    readmission_30d_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    mortality_rate_pct  = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    patient_falls       = models.IntegerField(default=0)
    hai_count           = models.IntegerField(default=0)
    # Financial
    gross_revenue       = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_revenue         = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    claim_denial_rate   = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    # Patient experience
    hcahps_overall      = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    nps_score           = models.IntegerField(null=True, blank=True)
    # Raw data
    raw_data     = models.JSONField(default=dict)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = "executive_kpi_snapshots"
        unique_together = [["facility_id", "snapshot_date"]]
        indexes   = [models.Index(fields=["facility_id", "snapshot_date"])]


class AIExecutiveBriefing(models.Model):
    """AI-generated daily executive briefing stored for retrieval."""
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    facility_id = models.UUIDField(db_index=True, null=True, blank=True)
    briefing_date= models.DateField(db_index=True)
    generated_by = models.CharField(max_length=30, default="claude")
    summary      = models.TextField()
    key_concerns = models.JSONField(default=list)
    recommended_actions = models.JSONField(default=list)
    data_snapshot_id = models.UUIDField(null=True, blank=True)
    generation_ms= models.IntegerField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "executive_ai_briefings"
        unique_together = [["facility_id", "briefing_date"]]


class StrategicGoal(models.Model):
    STATUS = [("on_track","On Track"),("at_risk","At Risk"),("behind","Behind"),("achieved","Achieved")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    facility_id = models.UUIDField(db_index=True, null=True, blank=True)
    title        = models.CharField(max_length=255)
    category     = models.CharField(max_length=50, choices=[
        ("quality","Quality"),("safety","Patient Safety"),("finance","Finance"),
        ("experience","Patient Experience"),("growth","Growth"),("workforce","Workforce"),
    ])
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    current_value= models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit         = models.CharField(max_length=30, blank=True)
    target_date  = models.DateField()
    status       = models.CharField(max_length=20, choices=STATUS, default="on_track")
    owner_id     = models.UUIDField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "executive_strategic_goals"
