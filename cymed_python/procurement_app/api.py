from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.db import transaction
from typing import Optional
import uuid, datetime

from .models import Vendor, PurchaseRequisition, PRLine, PurchaseOrder, POLine, GoodsReceiptNote, GRNLine

router = Router()


# ── Vendors ───────────────────────────────────────────────────────────────────

class VendorOut(ModelSchema):
    class Meta:
        model  = Vendor
        fields = ["id", "name", "cr_number", "zatca_tin", "iban", "payment_terms", "performance_score", "is_approved", "is_active"]

class VendorIn(Schema):
    facility_id:    str
    name:           str
    cr_number:      str = ""
    zatca_tin:      str = ""
    iban:           str = ""
    contact_person: str = ""
    phone:          str = ""
    email:          str = ""
    payment_terms:  int = 30

@router.get("/vendors", response=list[VendorOut])
def list_vendors(request, facility_id: str, approved_only: bool = False):
    qs = Vendor.objects.filter(facility_id=facility_id, is_active=True)
    if approved_only:
        qs = qs.filter(is_approved=True)
    return list(qs)

@router.post("/vendors", response=VendorOut)
def create_vendor(request, payload: VendorIn):
    return Vendor.objects.create(**payload.dict())

@router.post("/vendors/{vendor_id}/approve")
def approve_vendor(request, vendor_id: str):
    v = get_object_or_404(Vendor, id=vendor_id)
    v.is_approved = True
    v.save(update_fields=["is_approved"])
    return {"approved": True}


# ── Purchase Requisitions ─────────────────────────────────────────────────────

class PRLineIn(Schema):
    item_id:              Optional[str] = None
    description:          str
    quantity:             float
    unit:                 str
    estimated_unit_price: float = 0

class PRIn(Schema):
    facility_id: str
    department:  str
    required_by: str
    notes:       str = ""
    lines:       list[PRLineIn]

class PROut(ModelSchema):
    class Meta:
        model  = PurchaseRequisition
        fields = ["id", "pr_number", "department", "required_by", "status", "total_amount"]

@router.get("/requisitions", response=list[PROut])
def list_prs(request, facility_id: str, status: str = ""):
    qs = PurchaseRequisition.objects.filter(facility_id=facility_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/requisitions", response=PROut)
def create_pr(request, payload: PRIn):
    with transaction.atomic():
        pr_number = f"PR-{datetime.date.today().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        total = sum(l.quantity * l.estimated_unit_price for l in payload.lines)
        pr = PurchaseRequisition.objects.create(
            facility_id  = payload.facility_id,
            pr_number    = pr_number,
            department   = payload.department,
            required_by  = payload.required_by,
            notes        = payload.notes,
            total_amount = total,
            status       = "submitted",
            requested_by = request.user if request.user.is_authenticated else None,
        )
        PRLine.objects.bulk_create([
            PRLine(requisition=pr, **l.dict()) for l in payload.lines
        ])
    return pr

@router.post("/requisitions/{pr_id}/approve")
def approve_pr(request, pr_id: str):
    pr = get_object_or_404(PurchaseRequisition, id=pr_id, status="submitted")
    pr.status      = "approved"
    pr.approved_by = request.user if request.user.is_authenticated else None
    pr.save(update_fields=["status", "approved_by"])
    return {"status": "approved"}


# ── Purchase Orders ───────────────────────────────────────────────────────────

class POLineIn(Schema):
    item_id:     Optional[str] = None
    description: str
    quantity:    float
    unit:        str
    unit_price:  float

class POIn(Schema):
    facility_id:    str
    vendor_id:      str
    requisition_id: Optional[str] = None
    order_date:     str
    delivery_date:  Optional[str] = None
    notes:          str = ""
    lines:          list[POLineIn]

class POOut(ModelSchema):
    class Meta:
        model  = PurchaseOrder
        fields = ["id", "po_number", "order_date", "status", "total_amount"]

@router.get("/orders", response=list[POOut])
def list_pos(request, facility_id: str, status: str = ""):
    qs = PurchaseOrder.objects.filter(facility_id=facility_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/orders", response=POOut)
def create_po(request, payload: POIn):
    with transaction.atomic():
        po_number = f"PO-{datetime.date.today().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        vat_rate  = 0.15
        subtotal  = sum(l.quantity * l.unit_price for l in payload.lines)
        vat       = round(subtotal * vat_rate, 2)
        po = PurchaseOrder.objects.create(
            facility_id    = payload.facility_id,
            po_number      = po_number,
            vendor_id      = payload.vendor_id,
            requisition_id = payload.requisition_id,
            order_date     = payload.order_date,
            delivery_date  = payload.delivery_date,
            notes          = payload.notes,
            subtotal       = subtotal,
            vat_amount     = vat,
            total_amount   = subtotal + vat,
            status         = "draft",
            created_by     = request.user if request.user.is_authenticated else None,
        )
        POLine.objects.bulk_create([
            POLine(
                po=po,
                item_id     = l.item_id,
                description = l.description,
                quantity    = l.quantity,
                unit        = l.unit,
                unit_price  = l.unit_price,
                line_total  = round(l.quantity * l.unit_price, 2),
            ) for l in payload.lines
        ])
    return po

@router.post("/orders/{po_id}/approve")
def approve_po(request, po_id: str):
    po = get_object_or_404(PurchaseOrder, id=po_id, status="draft")
    po.status      = "approved"
    po.approved_by = request.user if request.user.is_authenticated else None
    po.save(update_fields=["status", "approved_by"])
    return {"status": "approved"}


# ── Goods Receipt Notes ───────────────────────────────────────────────────────

class GRNLineIn(Schema):
    po_line_id:      str
    received_qty:    float
    accepted_qty:    float
    rejected_qty:    float = 0
    rejection_reason: str = ""
    batch_number:    str = ""
    expiry_date:     Optional[str] = None

class GRNIn(Schema):
    po_id:         str
    received_date: str
    notes:         str = ""
    lines:         list[GRNLineIn]

class GRNOut(ModelSchema):
    class Meta:
        model  = GoodsReceiptNote
        fields = ["id", "grn_number", "received_date", "status"]

@router.post("/grn", response=GRNOut)
def create_grn(request, payload: GRNIn):
    with transaction.atomic():
        grn_number = f"GRN-{datetime.date.today().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        grn = GoodsReceiptNote.objects.create(
            grn_number    = grn_number,
            po_id         = payload.po_id,
            received_date = payload.received_date,
            notes         = payload.notes,
            status        = "draft",
            received_by   = request.user if request.user.is_authenticated else None,
        )
        GRNLine.objects.bulk_create([
            GRNLine(grn=grn, **l.dict()) for l in payload.lines
        ])
    return grn

@router.post("/grn/{grn_id}/confirm")
def confirm_grn(request, grn_id: str):
    grn = get_object_or_404(GoodsReceiptNote, id=grn_id, status="draft")
    grn.status = "confirmed"
    grn.save(update_fields=["status"])
    return {"status": "confirmed"}

@router.get("/grn", response=list[GRNOut])
def list_grns(request, po_id: str):
    return list(GoodsReceiptNote.objects.filter(po_id=po_id))
