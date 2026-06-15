from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum
from typing import Optional

from .models import (
    StorageFacility, MedicalItem, InventoryBatch,
    StockMovement, ReorderRule, StockAlert, MovementType
)

router = Router()


# ── Items ─────────────────────────────────────────────────────────────────────

class ItemOut(ModelSchema):
    class Meta:
        model  = MedicalItem
        fields = ["id", "sku", "name", "category", "unit_of_measure", "requires_cold_chain", "is_active"]

class ItemIn(Schema):
    sku:                str
    name:               str
    name_ar:            str = ""
    category:           str
    unit_of_measure:    str
    barcode:            str = ""
    sfda_code:          str = ""
    requires_cold_chain: bool = False
    is_controlled_drug:  bool = False

@router.get("/items", response=list[ItemOut])
def list_items(request, category: str = "", search: str = ""):
    qs = MedicalItem.objects.filter(is_active=True)
    if category:
        qs = qs.filter(category=category)
    if search:
        qs = qs.filter(name__icontains=search)
    return list(qs[:200])

@router.post("/items", response=ItemOut)
def create_item(request, payload: ItemIn):
    return MedicalItem.objects.create(**payload.dict())


# ── Stores ────────────────────────────────────────────────────────────────────

class StoreOut(ModelSchema):
    class Meta:
        model  = StorageFacility
        fields = ["id", "name", "location", "store_type", "is_cold_chain", "is_active"]

class StoreIn(Schema):
    facility_id:     str
    name:            str
    location:        str
    store_type:      str = "general"
    is_cold_chain:   bool = False
    temperature_min: Optional[float] = None
    temperature_max: Optional[float] = None

@router.get("/stores", response=list[StoreOut])
def list_stores(request, facility_id: str):
    return list(StorageFacility.objects.filter(facility_id=facility_id, is_active=True))

@router.post("/stores", response=StoreOut)
def create_store(request, payload: StoreIn):
    return StorageFacility.objects.create(**payload.dict())


# ── Stock Levels ──────────────────────────────────────────────────────────────

@router.get("/stock")
def stock_levels(request, facility_id: str, store_id: str = ""):
    qs = InventoryBatch.objects.filter(store__facility_id=facility_id)
    if store_id:
        qs = qs.filter(store_id=store_id)
    return list(
        qs.values("item__sku", "item__name", "store__name")
          .annotate(total_qty=Sum("quantity"))
          .order_by("item__name")
    )


# ── Stock Movements ───────────────────────────────────────────────────────────

class MovementIn(Schema):
    batch_id:      str
    movement_type: str
    quantity:      int
    from_store_id: Optional[str] = None
    to_store_id:   Optional[str] = None
    reference:     str = ""
    patient_id:    Optional[str] = None
    unit_cost:     float = 0
    notes:         str = ""

class MovementOut(ModelSchema):
    class Meta:
        model  = StockMovement
        fields = ["id", "movement_type", "quantity", "reference", "performed_at"]

@router.post("/movements", response=MovementOut)
def record_movement(request, payload: MovementIn):
    with transaction.atomic():
        batch = get_object_or_404(InventoryBatch, id=payload.batch_id)
        movement = StockMovement.objects.create(
            batch_id      = payload.batch_id,
            movement_type = payload.movement_type,
            quantity      = payload.quantity,
            from_store_id = payload.from_store_id,
            to_store_id   = payload.to_store_id,
            reference     = payload.reference,
            patient_id    = payload.patient_id,
            unit_cost     = payload.unit_cost,
            notes         = payload.notes,
            performed_by  = request.user if request.user.is_authenticated else None,
        )
        delta = payload.quantity if payload.movement_type == MovementType.RECEIVE else -payload.quantity
        batch.quantity += delta
        batch.save(update_fields=["quantity", "updated_at"])
        return movement

@router.get("/movements", response=list[MovementOut])
def list_movements(request, batch_id: str = "", store_id: str = ""):
    qs = StockMovement.objects.all()
    if batch_id:
        qs = qs.filter(batch_id=batch_id)
    if store_id:
        qs = qs.filter(batch__store_id=store_id)
    return list(qs[:200])


# ── Reorder Rules ─────────────────────────────────────────────────────────────

class ReorderOut(ModelSchema):
    class Meta:
        model  = ReorderRule
        fields = ["id", "min_qty", "max_qty", "reorder_qty", "is_active"]

class ReorderIn(Schema):
    item_id:     str
    store_id:    str
    min_qty:     int
    max_qty:     int
    reorder_qty: int

@router.get("/reorder-rules", response=list[ReorderOut])
def list_reorder_rules(request, store_id: str):
    return list(ReorderRule.objects.filter(store_id=store_id, is_active=True))

@router.post("/reorder-rules", response=ReorderOut)
def upsert_reorder_rule(request, payload: ReorderIn):
    obj, _ = ReorderRule.objects.update_or_create(
        item_id=payload.item_id, store_id=payload.store_id,
        defaults={"min_qty": payload.min_qty, "max_qty": payload.max_qty, "reorder_qty": payload.reorder_qty}
    )
    return obj


# ── Alerts ────────────────────────────────────────────────────────────────────

class AlertOut(ModelSchema):
    class Meta:
        model  = StockAlert
        fields = ["id", "alert_type", "current_qty", "threshold", "resolved", "created_at"]

@router.get("/alerts", response=list[AlertOut])
def list_alerts(request, facility_id: str, resolved: bool = False):
    return list(StockAlert.objects.filter(store__facility_id=facility_id, resolved=resolved)[:100])

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(request, alert_id: str):
    alert = get_object_or_404(StockAlert, id=alert_id)
    alert.resolved = True
    alert.save(update_fields=["resolved"])
    return {"resolved": True}
