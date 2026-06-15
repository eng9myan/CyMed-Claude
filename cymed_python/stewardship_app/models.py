"""Antimicrobial Stewardship Program (ASP)."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class AntimicrobialOrder(models.Model):
    REVIEW_STATUS = [("pending","Pending Review"),("approved","Approved"),("modified","Modified"),
                     ("discontinued","Discontinued — ASP"),("no_action","No Action Required")]
    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id   = models.UUIDField(null=True, blank=True)
    order_id       = models.UUIDField(help_text="Ref to CPOE medication order")
    antibiotic_name= models.CharField(max_length=100)
    route          = models.CharField(max_length=30)
    dose           = models.CharField(max_length=50)
    frequency      = models.CharField(max_length=50)
    indication     = models.CharField(max_length=255)
    culture_pending= models.BooleanField(default=False)
    review_status  = models.CharField(max_length=20, choices=REVIEW_STATUS, default="pending")
    reviewed_by    = models.UUIDField(null=True, blank=True)
    reviewed_at    = models.DateTimeField(null=True, blank=True)
    recommendation = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "asp_antimicrobial_orders"


class RestrictedAntibioticRequest(models.Model):
    STATUS = [("pending","Pending"),("approved","Approved"),("denied","Denied")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    antibiotic   = models.CharField(max_length=100)
    requested_by = models.UUIDField()
    indication   = models.TextField()
    cultures     = models.TextField(blank=True)
    status       = models.CharField(max_length=20, choices=STATUS, default="pending")
    asp_reviewer = models.UUIDField(null=True, blank=True)
    decision_notes = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    decided_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "asp_restricted_requests"


class DDDMetric(models.Model):
    """Defined Daily Dose tracking per ward/facility for reporting."""
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    ward_id      = models.UUIDField(null=True, blank=True)
    antibiotic   = models.CharField(max_length=100)
    period_month = models.DateField(help_text="First day of reporting month")
    ddd_per_100_bed_days = models.DecimalField(max_digits=8, decimal_places=2)
    total_doses  = models.IntegerField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "asp_ddd_metrics"
