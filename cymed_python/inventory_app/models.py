import uuid6
from django.db import models
from django.conf import settings

def _uuid7():
    return uuid6.uuid7()

generate_uuidv7 = _uuid7  # migration compatibility


class StorageFacility(models.Model):
    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    name            = models.CharField(max_length=255)
    location        = models.CharField(max_length=255)
    store_type      = models.CharField(max_length=50, default="general",
                          help_text="general|pharmacy|theatre|lab|central")
    is_cold_chain   = models.BooleanField(default=False)
    temperature_min = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    temperature_max = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    is_active       = models.BooleanField(default=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_storage_facilities"


class ItemCategory(models.TextChoices):
    MEDICATION   = "medication",   "Medication"
    CONSUMABLE   = "consumable",   "Consumable"
    EQUIPMENT    = "equipment",    "Equipment"
    REAGENT      = "reagent",      "Reagent"
    VACCINE      = "vaccine",      "Vaccine"
    LINEN        = "linen",        "Linen"

class MedicalItem(models.Model):
    id                 = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    sku                = models.CharField(max_length=100, unique=True)
    name               = models.CharField(max_length=255)
    name_ar            = models.CharField(max_length=255, blank=True)
    category           = models.CharField(max_length=20, choices=ItemCategory.choices)
    unit_of_measure    = models.CharField(max_length=50)
    barcode            = models.CharField(max_length=100, blank=True)
    sfda_code          = models.CharField(max_length=100, blank=True)
    requires_cold_chain = models.BooleanField(default=False)
    is_controlled_drug = models.BooleanField(default=False)
    is_active          = models.BooleanField(default=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_medical_items"


class InventoryBatch(models.Model):
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    item         = models.ForeignKey(MedicalItem, on_delete=models.CASCADE, related_name="batches")
    store        = models.ForeignKey(StorageFacility, on_delete=models.CASCADE, related_name="batches")
    lot_number   = models.CharField(max_length=100)
    quantity     = models.IntegerField(default=0)
    reserved_qty = models.IntegerField(default=0)
    expiry_date  = models.DateField(null=True, blank=True)
    received_date = models.DateField(auto_now_add=True)
    unit_cost    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_batches"
        ordering = ["expiry_date"]  # FEFO by default


class MovementType(models.TextChoices):
    RECEIVE   = "receive",   "Receive (GRN)"
    ISSUE     = "issue",     "Issue to Ward/Patient"
    TRANSFER  = "transfer",  "Inter-Store Transfer"
    RETURN    = "return",    "Return to Store"
    WRITEOFF  = "writeoff",  "Write-Off"
    DISPOSAL  = "disposal",  "Expiry Disposal"
    ADJUST    = "adjust",    "Stock Adjustment"

class StockMovement(models.Model):
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    batch        = models.ForeignKey(InventoryBatch, on_delete=models.PROTECT, related_name="movements")
    movement_type = models.CharField(max_length=15, choices=MovementType.choices)
    quantity     = models.IntegerField()
    from_store   = models.ForeignKey(StorageFacility, null=True, blank=True, on_delete=models.SET_NULL, related_name="outbound_movements")
    to_store     = models.ForeignKey(StorageFacility, null=True, blank=True, on_delete=models.SET_NULL, related_name="inbound_movements")
    reference    = models.CharField(max_length=100, blank=True, help_text="PO/Encounter/Transfer ref")
    patient_id   = models.UUIDField(null=True, blank=True)
    unit_cost    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes        = models.TextField(blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_stock_movements"
        ordering = ["-performed_at"]


class ReorderRule(models.Model):
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    item        = models.ForeignKey(MedicalItem, on_delete=models.CASCADE, related_name="reorder_rules")
    store       = models.ForeignKey(StorageFacility, on_delete=models.CASCADE)
    min_qty     = models.IntegerField()
    max_qty     = models.IntegerField()
    reorder_qty = models.IntegerField()
    is_active   = models.BooleanField(default=True)

    class Meta:
        db_table        = "inventory_reorder_rules"
        unique_together = [("item", "store")]


class StockAlert(models.Model):
    ALERT_TYPES = [
        ("low_stock", "Low Stock"),
        ("near_expiry", "Near Expiry (30 days)"),
        ("expired", "Expired"),
        ("cold_breach", "Cold Chain Breach"),
    ]
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    alert_type   = models.CharField(max_length=20, choices=ALERT_TYPES)
    item         = models.ForeignKey(MedicalItem, on_delete=models.CASCADE)
    store        = models.ForeignKey(StorageFacility, on_delete=models.CASCADE)
    batch        = models.ForeignKey(InventoryBatch, null=True, blank=True, on_delete=models.SET_NULL)
    current_qty  = models.IntegerField(default=0)
    threshold    = models.IntegerField(default=0)
    resolved     = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_stock_alerts"
