import uuid6
from django.db import models
from django.conf import settings

def _uuid7():
    return uuid6.uuid7()

generate_uuidv7 = _uuid7  # migration compatibility


class SalaryComponent(models.Model):
    COMP_TYPES = [
        ("basic",      "Basic Salary"),
        ("allowance",  "Allowance"),
        ("deduction",  "Deduction"),
        ("overtime",   "Overtime"),
        ("bonus",      "Bonus"),
    ]
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    code         = models.CharField(max_length=30, unique=True)
    name         = models.CharField(max_length=100)
    component_type = models.CharField(max_length=15, choices=COMP_TYPES)
    is_taxable   = models.BooleanField(default=False)
    is_gosi      = models.BooleanField(default=False, help_text="Included in GOSI base")
    is_active    = models.BooleanField(default=True)

    class Meta:
        db_table = "payroll_salary_components"


class SalaryStructure(models.Model):
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    professional_id = models.UUIDField(db_index=True, help_text="hr_app.HealthcareProfessional")
    facility_id = models.UUIDField(null=True, blank=True)
    effective_date = models.DateField()
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    housing_allowance  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    on_call_allowance  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_allowances   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_current   = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payroll_salary_structures"
        ordering = ["-effective_date"]


class PayrollRun(models.Model):
    STATUS = [
        ("draft",    "Draft"),
        ("approved", "Approved"),
        ("paid",     "Paid"),
    ]
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    month       = models.IntegerField()
    year        = models.IntegerField()
    status      = models.CharField(max_length=10, choices=STATUS, default="draft")
    total_gross = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_net   = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="approved_payrolls")
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = "payroll_runs"
        unique_together = [("facility_id", "month", "year")]


class PayrollEntry(models.Model):
    id               = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    run              = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="entries")
    professional_id  = models.UUIDField(db_index=True)
    basic_salary     = models.DecimalField(max_digits=12, decimal_places=2)
    total_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    overtime_amount  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_salary     = models.DecimalField(max_digits=12, decimal_places=2)
    absence_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    loan_deduction   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gosi_employee    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gosi_employer    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary       = models.DecimalField(max_digits=12, decimal_places=2)
    working_days     = models.IntegerField(default=30)
    days_absent      = models.IntegerField(default=0)
    overtime_hours   = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        db_table = "payroll_entries"


class EOSBRecord(models.Model):
    """End-of-Service Benefit — Saudi Labour Law Art. 84."""
    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    professional_id = models.UUIDField(db_index=True)
    facility_id = models.UUIDField(null=True, blank=True)
    hire_date       = models.DateField()
    end_date        = models.DateField()
    years_service   = models.DecimalField(max_digits=5, decimal_places=2)
    last_basic      = models.DecimalField(max_digits=12, decimal_places=2)
    eosb_amount     = models.DecimalField(max_digits=12, decimal_places=2)
    reason          = models.CharField(max_length=50, help_text="resignation|termination|retirement")
    paid            = models.BooleanField(default=False)
    paid_at         = models.DateTimeField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payroll_eosb_records"


# Old model kept for migration compatibility
class Payroll(models.Model):
    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    professional_id = models.UUIDField(db_index=True, null=True, blank=True)
    month_year      = models.CharField(max_length=20)
    basic_salary    = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    allowances      = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    deductions      = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    net_salary      = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status          = models.CharField(max_length=50, default="Pending")
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_records"
