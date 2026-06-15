from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from typing import Optional
from decimal import Decimal

from .models import SalaryStructure, SalaryComponent, PayrollRun, PayrollEntry, EOSBRecord

router = Router()


# ── Salary Structures ─────────────────────────────────────────────────────────

class StructureOut(ModelSchema):
    class Meta:
        model  = SalaryStructure
        fields = ["id", "professional_id", "effective_date", "basic_salary",
                  "housing_allowance", "transport_allowance", "on_call_allowance",
                  "other_allowances", "is_current"]

class StructureIn(Schema):
    professional_id:     str
    facility_id:         str
    effective_date:      str
    basic_salary:        float
    housing_allowance:   float = 0
    transport_allowance: float = 0
    on_call_allowance:   float = 0
    other_allowances:    float = 0

@router.get("/salary-structures", response=list[StructureOut])
def list_structures(request, professional_id: str):
    return list(SalaryStructure.objects.filter(professional_id=professional_id).order_by("-effective_date"))

@router.post("/salary-structures", response=StructureOut)
def create_structure(request, payload: StructureIn):
    SalaryStructure.objects.filter(professional_id=payload.professional_id, is_current=True).update(is_current=False)
    return SalaryStructure.objects.create(**payload.dict(), is_current=True)


# ── Payroll Runs ──────────────────────────────────────────────────────────────

class RunOut(ModelSchema):
    class Meta:
        model  = PayrollRun
        fields = ["id", "month", "year", "status", "total_gross", "total_deductions", "total_net"]

class RunIn(Schema):
    facility_id: str
    month:       int
    year:        int

@router.get("/runs", response=list[RunOut])
def list_runs(request, facility_id: str):
    return list(PayrollRun.objects.filter(facility_id=facility_id).order_by("-year", "-month"))

@router.post("/runs", response=RunOut)
def create_run(request, payload: RunIn):
    run, created = PayrollRun.objects.get_or_create(
        facility_id=payload.facility_id, month=payload.month, year=payload.year,
        defaults={"status": "draft"}
    )
    return run

@router.post("/runs/{run_id}/approve")
def approve_run(request, run_id: str):
    run = get_object_or_404(PayrollRun, id=run_id, status="draft")
    run.status      = "approved"
    run.approved_by = request.user if request.user.is_authenticated else None
    run.approved_at = timezone.now()
    run.save(update_fields=["status", "approved_by", "approved_at"])
    return {"status": "approved"}


# ── Payroll Entries ───────────────────────────────────────────────────────────

class EntryOut(ModelSchema):
    class Meta:
        model  = PayrollEntry
        fields = ["id", "professional_id", "basic_salary", "total_allowances",
                  "gross_salary", "total_deductions", "net_salary", "days_absent"]

class EntryIn(Schema):
    run_id:            str
    professional_id:   str
    basic_salary:      float
    total_allowances:  float = 0
    overtime_amount:   float = 0
    absence_deduction: float = 0
    loan_deduction:    float = 0
    gosi_employee:     float = 0
    gosi_employer:     float = 0
    working_days:      int   = 30
    days_absent:       int   = 0
    overtime_hours:    float = 0

@router.get("/runs/{run_id}/entries", response=list[EntryOut])
def list_entries(request, run_id: str):
    return list(PayrollEntry.objects.filter(run_id=run_id))

@router.post("/runs/{run_id}/entries", response=EntryOut)
def add_entry(request, run_id: str, payload: EntryIn):
    gross = payload.basic_salary + payload.total_allowances + payload.overtime_amount
    total_ded = payload.absence_deduction + payload.loan_deduction + payload.gosi_employee
    net = gross - total_ded
    return PayrollEntry.objects.create(
        run_id=run_id,
        professional_id=payload.professional_id,
        basic_salary=payload.basic_salary,
        total_allowances=payload.total_allowances,
        overtime_amount=payload.overtime_amount,
        gross_salary=gross,
        absence_deduction=payload.absence_deduction,
        loan_deduction=payload.loan_deduction,
        gosi_employee=payload.gosi_employee,
        gosi_employer=payload.gosi_employer,
        total_deductions=total_ded,
        net_salary=net,
        working_days=payload.working_days,
        days_absent=payload.days_absent,
        overtime_hours=payload.overtime_hours,
    )


# ── EOSB Calculator ───────────────────────────────────────────────────────────

class EOSBIn(Schema):
    professional_id: str
    facility_id:     str
    hire_date:       str
    end_date:        str
    last_basic:      float
    reason:          str  # resignation|termination|retirement

class EOSBOut(ModelSchema):
    class Meta:
        model  = EOSBRecord
        fields = ["id", "years_service", "last_basic", "eosb_amount", "reason", "paid"]

@router.post("/eosb/calculate", response=EOSBOut)
def calculate_eosb(request, payload: EOSBIn):
    import datetime
    hire = datetime.date.fromisoformat(payload.hire_date)
    end  = datetime.date.fromisoformat(payload.end_date)
    years = Decimal(str((end - hire).days / 365.25))
    basic = Decimal(str(payload.last_basic))

    if payload.reason == "resignation":
        if years < 2:
            amount = Decimal("0")
        elif years < 5:
            amount = basic * years * Decimal("0.3333")
        elif years < 10:
            amount = basic * years * Decimal("0.6667")
        else:
            amount = basic * years
    else:
        amount = basic * years

    return EOSBRecord.objects.create(
        professional_id=payload.professional_id,
        facility_id=payload.facility_id,
        hire_date=hire,
        end_date=end,
        years_service=years,
        last_basic=basic,
        eosb_amount=amount,
        reason=payload.reason,
    )
