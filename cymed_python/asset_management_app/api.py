from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.utils import timezone
from typing import Optional
from decimal import Decimal
import datetime

from .models import AssetCategory, Asset, DepreciationSchedule, MaintenanceOrder

router = Router()


# ── Asset Categories ──────────────────────────────────────────────────────────

class CategoryOut(ModelSchema):
    class Meta:
        model  = AssetCategory
        fields = ["id", "name", "useful_life_years", "depreciation_method", "salvage_pct"]

class CategoryIn(Schema):
    name:                str
    useful_life_years:   int = 5
    depreciation_method: str = "straight_line"
    salvage_pct:         float = 0

@router.get("/categories", response=list[CategoryOut])
def list_categories(request):
    return list(AssetCategory.objects.all())

@router.post("/categories", response=CategoryOut)
def create_category(request, payload: CategoryIn):
    return AssetCategory.objects.create(**payload.dict())


# ── Assets ────────────────────────────────────────────────────────────────────

class AssetOut(ModelSchema):
    class Meta:
        model  = Asset
        fields = ["id", "asset_tag", "name", "manufacturer", "serial_number",
                  "acquisition_date", "acquisition_cost", "book_value", "status"]

class AssetIn(Schema):
    facility_id:      str
    category_id:      str
    asset_tag:        str
    name:             str
    manufacturer:     str = ""
    model_number:     str = ""
    serial_number:    Optional[str] = None
    department_id:    Optional[str] = None
    location:         str = ""
    acquisition_date: str
    acquisition_cost: float
    salvage_value:    float = 0
    insurance_policy: str = ""
    insurance_expiry: Optional[str] = None
    warranty_expiry:  Optional[str] = None
    next_calibration: Optional[str] = None
    notes:            str = ""

@router.get("/assets", response=list[AssetOut])
def list_assets(request, facility_id: str, status: str = "", department_id: str = ""):
    qs = Asset.objects.filter(facility_id=facility_id)
    if status:
        qs = qs.filter(status=status)
    if department_id:
        qs = qs.filter(department_id=department_id)
    return list(qs[:200])

@router.post("/assets", response=AssetOut)
def create_asset(request, payload: AssetIn):
    data = payload.dict()
    data["book_value"] = data["acquisition_cost"] - data["salvage_value"]
    return Asset.objects.create(**data)

@router.get("/assets/{asset_id}", response=AssetOut)
def get_asset(request, asset_id: str):
    return get_object_or_404(Asset, id=asset_id)

@router.post("/assets/{asset_id}/decommission")
def decommission_asset(request, asset_id: str):
    asset = get_object_or_404(Asset, id=asset_id)
    asset.status = "decommissioned"
    asset.save(update_fields=["status", "updated_at"])
    return {"status": "decommissioned"}


# ── Depreciation ──────────────────────────────────────────────────────────────

@router.post("/assets/{asset_id}/depreciation/generate")
def generate_depreciation(request, asset_id: str):
    """Generate full straight-line or declining-balance depreciation schedule."""
    asset    = get_object_or_404(Asset, id=asset_id)
    category = asset.category
    cost     = Decimal(str(asset.acquisition_cost))
    salvage  = Decimal(str(asset.salvage_value))
    life     = category.useful_life_years
    method   = category.depreciation_method

    periods = life * 12
    acq     = asset.acquisition_date
    acc_dep = Decimal("0")
    book    = cost
    rows    = []

    for i in range(periods):
        period_date = datetime.date(acq.year + (acq.month + i - 1) // 12,
                                    (acq.month + i - 1) % 12 + 1, 1)
        if method == "straight_line":
            dep = round((cost - salvage) / periods, 2)
        else:  # declining_balance
            rate = Decimal("2") / Decimal(str(life * 12))
            dep  = round(book * rate, 2)

        dep      = min(dep, book - salvage)
        acc_dep += dep
        book    -= dep
        rows.append(DepreciationSchedule(
            asset=asset, period_date=period_date,
            depreciation=dep, accumulated_dep=acc_dep, book_value=book
        ))
        if book <= salvage:
            break

    DepreciationSchedule.objects.filter(asset=asset).delete()
    DepreciationSchedule.objects.bulk_create(rows)
    return {"periods_generated": len(rows)}

class DepScheduleOut(ModelSchema):
    class Meta:
        model  = DepreciationSchedule
        fields = ["id", "period_date", "depreciation", "accumulated_dep", "book_value", "posted"]

@router.get("/assets/{asset_id}/depreciation", response=list[DepScheduleOut])
def get_depreciation_schedule(request, asset_id: str):
    return list(DepreciationSchedule.objects.filter(asset_id=asset_id))


# ── Maintenance Orders ────────────────────────────────────────────────────────

class MaintIn(Schema):
    asset_id:       str
    order_type:     str
    scheduled_date: str
    description:    str
    performed_by:   str = ""
    vendor_id:      Optional[str] = None

class MaintOut(ModelSchema):
    class Meta:
        model  = MaintenanceOrder
        fields = ["id", "order_type", "status", "scheduled_date", "completed_date", "cost", "downtime_hours"]

@router.get("/maintenance", response=list[MaintOut])
def list_maintenance(request, asset_id: str = "", status: str = ""):
    qs = MaintenanceOrder.objects.all()
    if asset_id:
        qs = qs.filter(asset_id=asset_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/maintenance", response=MaintOut)
def create_maintenance_order(request, payload: MaintIn):
    return MaintenanceOrder.objects.create(**payload.dict(), status="open")

@router.post("/maintenance/{order_id}/complete")
def complete_maintenance(request, order_id: str, cost: float = 0, downtime_hours: float = 0, findings: str = ""):
    order = get_object_or_404(MaintenanceOrder, id=order_id)
    order.status         = "completed"
    order.completed_date = datetime.date.today()
    order.cost           = cost
    order.downtime_hours = downtime_hours
    order.findings       = findings
    order.save(update_fields=["status", "completed_date", "cost", "downtime_hours", "findings"])
    return {"status": "completed"}
