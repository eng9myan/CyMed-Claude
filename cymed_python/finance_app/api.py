from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from typing import Optional
import uuid

from .models import (
    GLAccount, CostCenter, AnnualBudget, AccountingPeriod,
    JournalEntry, JournalLine, APInvoice, ARInvoice, BankAccount, BankStatement
)

router = Router()


# ── GL Accounts ───────────────────────────────────────────────────────────────

class GLAccountOut(ModelSchema):
    class Meta:
        model = GLAccount
        fields = ["id", "code", "name", "name_ar", "account_type", "is_active", "allow_posting", "is_header"]

class GLAccountIn(Schema):
    facility_id:   str
    code:          str
    name:          str
    name_ar:       str = ""
    account_type:  str
    parent_id:     Optional[str] = None
    cost_center_id: Optional[str] = None
    is_header:     bool = False

@router.get("/accounts", response=list[GLAccountOut])
def list_accounts(request, facility_id: str, account_type: str = ""):
    qs = GLAccount.objects.filter(facility_id=facility_id, is_active=True)
    if account_type:
        qs = qs.filter(account_type=account_type)
    return list(qs)

@router.post("/accounts", response=GLAccountOut)
def create_account(request, payload: GLAccountIn):
    return GLAccount.objects.create(**payload.dict())

@router.delete("/accounts/{account_id}")
def deactivate_account(request, account_id: str):
    obj = get_object_or_404(GLAccount, id=account_id)
    obj.is_active = False
    obj.save(update_fields=["is_active"])
    return {"success": True}


# ── Cost Centers ──────────────────────────────────────────────────────────────

class CostCenterOut(ModelSchema):
    class Meta:
        model = CostCenter
        fields = ["id", "code", "name", "department", "is_active"]

class CostCenterIn(Schema):
    code:       str
    name:       str
    department: str
    manager_id: Optional[str] = None

@router.get("/cost-centers", response=list[CostCenterOut])
def list_cost_centers(request):
    return list(CostCenter.objects.filter(is_active=True))

@router.post("/cost-centers", response=CostCenterOut)
def create_cost_center(request, payload: CostCenterIn):
    return CostCenter.objects.create(**payload.dict())


# ── Accounting Periods ────────────────────────────────────────────────────────

class PeriodOut(ModelSchema):
    class Meta:
        model = AccountingPeriod
        fields = ["id", "name", "start_date", "end_date", "status"]

class PeriodIn(Schema):
    facility_id: str
    name:        str
    start_date:  str
    end_date:    str

@router.get("/periods", response=list[PeriodOut])
def list_periods(request, facility_id: str):
    return list(AccountingPeriod.objects.filter(facility_id=facility_id))

@router.post("/periods", response=PeriodOut)
def create_period(request, payload: PeriodIn):
    return AccountingPeriod.objects.create(**payload.dict())

@router.post("/periods/{period_id}/close")
def close_period(request, period_id: str):
    period = get_object_or_404(AccountingPeriod, id=period_id)
    period.status    = "closed"
    period.closed_by = request.user if request.user.is_authenticated else None
    period.closed_at = timezone.now()
    period.save(update_fields=["status", "closed_by", "closed_at"])
    return {"status": "closed"}


# ── Journal Entries ───────────────────────────────────────────────────────────

class JournalLineIn(Schema):
    account_id:     str
    cost_center_id: Optional[str] = None
    description:    str = ""
    debit:          float = 0
    credit:         float = 0
    currency:       str = "SAR"
    fx_rate:        float = 1.0

class JournalIn(Schema):
    facility_id: str
    period_id:   str
    entry_date:  str
    description: str
    source:      str = "manual"
    source_ref:  str = ""
    lines:       list[JournalLineIn]

class JournalOut(ModelSchema):
    class Meta:
        model = JournalEntry
        fields = ["id", "entry_number", "entry_date", "description", "status", "source", "created_at"]

@router.get("/journals", response=list[JournalOut])
def list_journals(request, facility_id: str, period_id: str = ""):
    qs = JournalEntry.objects.filter(facility_id=facility_id)
    if period_id:
        qs = qs.filter(period_id=period_id)
    return list(qs[:200])

@router.post("/journals", response=JournalOut)
def create_journal(request, payload: JournalIn):
    total_debit  = sum(l.debit  for l in payload.lines)
    total_credit = sum(l.credit for l in payload.lines)
    if round(total_debit, 2) != round(total_credit, 2):
        from ninja import errors
        raise errors.HttpError(400, "Journal is not balanced")

    with transaction.atomic():
        import datetime
        entry_number = f"JE-{datetime.date.today().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        entry = JournalEntry.objects.create(
            facility_id  = payload.facility_id,
            period_id    = payload.period_id,
            entry_number = entry_number,
            entry_date   = payload.entry_date,
            description  = payload.description,
            source       = payload.source,
            source_ref   = payload.source_ref,
            created_by   = request.user if request.user.is_authenticated else None,
        )
        JournalLine.objects.bulk_create([
            JournalLine(
                journal_id     = entry.id,
                account_id     = l.account_id,
                cost_center_id = l.cost_center_id,
                description    = l.description,
                debit          = l.debit,
                credit         = l.credit,
                currency       = l.currency,
                fx_rate        = l.fx_rate,
            ) for l in payload.lines
        ])
    return entry

@router.post("/journals/{journal_id}/post")
def post_journal(request, journal_id: str):
    entry = get_object_or_404(JournalEntry, id=journal_id, status="draft")
    entry.status    = "posted"
    entry.posted_by = request.user if request.user.is_authenticated else None
    entry.posted_at = timezone.now()
    entry.save(update_fields=["status", "posted_by", "posted_at"])
    return {"status": "posted"}


# ── AP Invoices ───────────────────────────────────────────────────────────────

class APOut(ModelSchema):
    class Meta:
        model = APInvoice
        fields = ["id", "invoice_number", "invoice_date", "due_date", "total", "paid_amount", "status"]

class APIn(Schema):
    facility_id:    str
    vendor_id:      str
    po_id:          Optional[str] = None
    invoice_number: str
    invoice_date:   str
    due_date:       str
    subtotal:       float
    vat_amount:     float = 0
    total:          float
    notes:          str = ""

@router.get("/ap", response=list[APOut])
def list_ap(request, facility_id: str, status: str = ""):
    qs = APInvoice.objects.filter(facility_id=facility_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/ap", response=APOut)
def create_ap(request, payload: APIn):
    return APInvoice.objects.create(**payload.dict())

@router.post("/ap/{invoice_id}/approve")
def approve_ap(request, invoice_id: str):
    inv = get_object_or_404(APInvoice, id=invoice_id, status="draft")
    inv.status = "approved"
    inv.save(update_fields=["status"])
    return {"status": "approved"}


# ── AR Invoices ───────────────────────────────────────────────────────────────

class AROut(ModelSchema):
    class Meta:
        model = ARInvoice
        fields = ["id", "invoice_number", "invoice_date", "total", "collected", "status", "zatca_status"]

class ARIn(Schema):
    facility_id:    str
    patient_id:     Optional[str] = None
    insurer_id:     Optional[str] = None
    encounter_id:   Optional[str] = None
    invoice_number: str
    invoice_date:   str
    due_date:       str
    subtotal:       float
    discount:       float = 0
    vat_amount:     float = 0
    total:          float

@router.get("/ar", response=list[AROut])
def list_ar(request, facility_id: str, status: str = ""):
    qs = ARInvoice.objects.filter(facility_id=facility_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/ar", response=AROut)
def create_ar(request, payload: ARIn):
    return ARInvoice.objects.create(**payload.dict())


# ── Trial Balance ─────────────────────────────────────────────────────────────

@router.get("/trial-balance")
def trial_balance(request, facility_id: str, period_id: str):
    from django.db.models import Sum, Q
    lines = (
        JournalLine.objects
        .filter(journal__facility_id=facility_id, journal__period_id=period_id, journal__status="posted")
        .values("account__code", "account__name", "account__account_type")
        .annotate(total_debit=Sum("debit"), total_credit=Sum("credit"))
        .order_by("account__code")
    )
    return list(lines)
