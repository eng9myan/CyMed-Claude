import uuid6
from django.db import models
from django.conf import settings

def _uuid7():
    return uuid6.uuid7()

generate_uuidv7 = _uuid7  # migration compatibility


class Vendor(models.Model):
    id             = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    name           = models.CharField(max_length=255)
    cr_number      = models.CharField(max_length=50, blank=True, help_text="Commercial Registration")
    zatca_tin      = models.CharField(max_length=15, blank=True, help_text="VAT Registration Number")
    iban           = models.CharField(max_length=34, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    phone          = models.CharField(max_length=50, blank=True)
    email          = models.EmailField(blank=True)
    address        = models.TextField(blank=True)
    payment_terms  = models.IntegerField(default=30, help_text="Net days")
    performance_score = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    is_approved    = models.BooleanField(default=False)
    is_active      = models.BooleanField(default=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "procurement_vendors"


class PurchaseRequisition(models.Model):
    PR_STATUS = [
        ("draft",    "Draft"),
        ("submitted","Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("fulfilled","Fulfilled"),
    ]
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    pr_number    = models.CharField(max_length=30, unique=True)
    department   = models.CharField(max_length=100)
    required_by  = models.DateField()
    status       = models.CharField(max_length=15, choices=PR_STATUS, default="draft")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    budget_check_passed = models.BooleanField(default=False)
    notes        = models.TextField(blank=True)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="requisitions")
    approved_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_requisitions")
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "procurement_requisitions"


class PRLine(models.Model):
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    requisition  = models.ForeignKey(PurchaseRequisition, on_delete=models.CASCADE, related_name="lines")
    item_id      = models.UUIDField(null=True, blank=True, help_text="inventory_app.MedicalItem")
    description  = models.CharField(max_length=255)
    quantity     = models.DecimalField(max_digits=10, decimal_places=2)
    unit         = models.CharField(max_length=50)
    estimated_unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = "procurement_pr_lines"


class PurchaseOrder(models.Model):
    PO_STATUS = [
        ("draft",    "Draft"),
        ("approved", "Approved"),
        ("sent",     "Sent to Vendor"),
        ("partial",  "Partially Received"),
        ("received", "Fully Received"),
        ("cancelled","Cancelled"),
    ]
    id             = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    po_number      = models.CharField(max_length=30, unique=True)
    vendor         = models.ForeignKey(Vendor, on_delete=models.PROTECT)
    requisition    = models.ForeignKey(PurchaseRequisition, null=True, blank=True, on_delete=models.SET_NULL)
    order_date     = models.DateField()
    delivery_date  = models.DateField(null=True, blank=True)
    status         = models.CharField(max_length=15, choices=PO_STATUS, default="draft")
    subtotal       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_amount     = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes          = models.TextField(blank=True)
    created_by     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_pos")
    approved_by    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_pos")
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "procurement_purchase_orders"


class POLine(models.Model):
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    po          = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="lines")
    item_id     = models.UUIDField(null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity    = models.DecimalField(max_digits=10, decimal_places=2)
    received_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit        = models.CharField(max_length=50)
    unit_price  = models.DecimalField(max_digits=10, decimal_places=2)
    line_total  = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "procurement_po_lines"


class GoodsReceiptNote(models.Model):
    GRN_STATUS = [("draft", "Draft"), ("confirmed", "Confirmed")]
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    grn_number  = models.CharField(max_length=30, unique=True)
    po          = models.ForeignKey(PurchaseOrder, on_delete=models.PROTECT, related_name="grns")
    received_date = models.DateField()
    status      = models.CharField(max_length=15, choices=GRN_STATUS, default="draft")
    notes       = models.TextField(blank=True)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "procurement_grns"


class GRNLine(models.Model):
    id            = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    grn           = models.ForeignKey(GoodsReceiptNote, on_delete=models.CASCADE, related_name="lines")
    po_line       = models.ForeignKey(POLine, on_delete=models.PROTECT)
    received_qty  = models.DecimalField(max_digits=10, decimal_places=2)
    accepted_qty  = models.DecimalField(max_digits=10, decimal_places=2)
    rejected_qty  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rejection_reason = models.CharField(max_length=255, blank=True)
    batch_number  = models.CharField(max_length=100, blank=True)
    expiry_date   = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "procurement_grn_lines"


# Old model kept for migration compatibility
class Supplier(models.Model):
    id             = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    name           = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    phone          = models.CharField(max_length=50, null=True, blank=True)
    email          = models.EmailField(null=True, blank=True)
    address        = models.TextField(null=True, blank=True)
    is_active      = models.BooleanField(default=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "procurement_suppliers"


class PurchaseOrderItem(models.Model):
    id             = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    purchase_order = models.ForeignKey(PurchaseOrder, related_name="items", on_delete=models.CASCADE)
    item_name      = models.CharField(max_length=255)
    quantity       = models.IntegerField()
    unit_price     = models.DecimalField(max_digits=10, decimal_places=2)
    total_price    = models.DecimalField(max_digits=12, decimal_places=2)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "procurement_purchase_order_items"
