import uuid6
from django.db import models
from django.conf import settings

def _uuid7():
    return uuid6.uuid7()

generate_uuidv7 = _uuid7  # migration compatibility


class AssetCategory(models.Model):
    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    name            = models.CharField(max_length=100)
    useful_life_years = models.IntegerField(default=5)
    depreciation_method = models.CharField(max_length=20, default="straight_line",
                              help_text="straight_line|declining_balance")
    salvage_pct     = models.DecimalField(max_digits=5, decimal_places=2, default=0,
                          help_text="Residual value as % of cost")

    class Meta:
        db_table = "asset_categories"


class AssetStatus(models.TextChoices):
    IN_SERVICE     = "in_service",     "In Service"
    MAINTENANCE    = "maintenance",    "Under Maintenance"
    DECOMMISSIONED = "decommissioned", "Decommissioned"
    DISPOSED       = "disposed",       "Disposed"

class Asset(models.Model):
    id               = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    category         = models.ForeignKey(AssetCategory, on_delete=models.PROTECT)
    asset_tag        = models.CharField(max_length=50, unique=True)
    name             = models.CharField(max_length=255)
    manufacturer     = models.CharField(max_length=255, blank=True)
    model_number     = models.CharField(max_length=100, blank=True)
    serial_number    = models.CharField(max_length=100, unique=True, null=True, blank=True)
    department_id    = models.UUIDField(null=True, blank=True)
    location         = models.CharField(max_length=255, blank=True)
    acquisition_date = models.DateField()
    acquisition_cost = models.DecimalField(max_digits=15, decimal_places=2)
    salvage_value    = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    book_value       = models.DecimalField(max_digits=15, decimal_places=2)
    status           = models.CharField(max_length=20, choices=AssetStatus.choices, default=AssetStatus.IN_SERVICE)
    insurance_policy = models.CharField(max_length=100, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    warranty_expiry  = models.DateField(null=True, blank=True)
    next_calibration = models.DateField(null=True, blank=True)
    notes            = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "asset_register"


class DepreciationSchedule(models.Model):
    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    asset           = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="depreciation_schedule")
    period_date     = models.DateField(help_text="First day of the month")
    depreciation    = models.DecimalField(max_digits=15, decimal_places=2)
    accumulated_dep = models.DecimalField(max_digits=15, decimal_places=2)
    book_value      = models.DecimalField(max_digits=15, decimal_places=2)
    posted          = models.BooleanField(default=False)
    journal_entry_id = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table        = "asset_depreciation_schedule"
        unique_together = [("asset", "period_date")]
        ordering        = ["period_date"]


class MaintenanceOrder(models.Model):
    MAINT_TYPE   = [("preventive", "Preventive"), ("corrective", "Corrective"), ("calibration", "Calibration")]
    MAINT_STATUS = [("open", "Open"), ("in_progress", "In Progress"), ("completed", "Completed")]

    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    asset           = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="maintenance_orders")
    order_type      = models.CharField(max_length=15, choices=MAINT_TYPE)
    status          = models.CharField(max_length=15, choices=MAINT_STATUS, default="open")
    scheduled_date  = models.DateField()
    completed_date  = models.DateField(null=True, blank=True)
    performed_by    = models.CharField(max_length=255, blank=True)
    vendor_id       = models.UUIDField(null=True, blank=True, help_text="AMC vendor")
    description     = models.TextField()
    findings        = models.TextField(blank=True)
    cost            = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    downtime_hours  = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "asset_maintenance_orders"


# Old models kept for migration compatibility
class BiomedicalAsset(models.Model):
    id                   = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    name                 = models.CharField(max_length=255)
    asset_type           = models.CharField(max_length=100)
    manufacturer         = models.CharField(max_length=255, null=True, blank=True)
    model_number         = models.CharField(max_length=100, null=True, blank=True)
    serial_number        = models.CharField(max_length=100, unique=True, null=True, blank=True)
    department_id        = models.UUIDField(db_index=True, null=True, blank=True)
    acquisition_date     = models.DateField(null=True, blank=True)
    status               = models.CharField(max_length=50, default="Operational")
    next_calibration_date = models.DateField(null=True, blank=True)
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "asset_biomedical_assets"


class MaintenanceLog(models.Model):
    id               = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    asset            = models.ForeignKey(BiomedicalAsset, on_delete=models.CASCADE)
    maintenance_date = models.DateField()
    performed_by     = models.CharField(max_length=255)
    description      = models.TextField()
    cost             = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "asset_maintenance_logs"
