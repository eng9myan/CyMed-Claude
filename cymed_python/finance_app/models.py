import uuid6
from django.db import models
from django.conf import settings

def _uuid7():
    return uuid6.uuid7()

generate_uuidv7 = _uuid7  # migration compatibility


# ── Chart of Accounts ─────────────────────────────────────────────────────────

class AccountType(models.TextChoices):
    ASSET     = "asset",     "Asset"
    LIABILITY = "liability", "Liability"
    EQUITY    = "equity",    "Equity"
    INCOME    = "income",    "Income"
    EXPENSE   = "expense",   "Expense"

class GLAccount(models.Model):
    id            = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    code          = models.CharField(max_length=20)
    name          = models.CharField(max_length=255)
    name_ar       = models.CharField(max_length=255, blank=True)
    account_type  = models.CharField(max_length=20, choices=AccountType.choices)
    parent        = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")
    cost_center   = models.ForeignKey("CostCenter", null=True, blank=True, on_delete=models.SET_NULL)
    is_header     = models.BooleanField(default=False)
    is_active     = models.BooleanField(default=True)
    allow_posting = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table          = "fin_gl_accounts"
        unique_together   = [("facility_id", "code")]
        ordering          = ["code"]

    def __str__(self):
        return f"{self.code} {self.name}"


class CostCenter(models.Model):
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    code        = models.CharField(max_length=50, unique=True)
    name        = models.CharField(max_length=255)
    department  = models.CharField(max_length=100)
    manager_id  = models.UUIDField(null=True, blank=True)
    is_active   = models.BooleanField(default=True)

    class Meta:
        db_table = "fin_cost_centers"


class AnnualBudget(models.Model):
    id               = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    cost_center      = models.ForeignKey(CostCenter, on_delete=models.CASCADE, related_name="budgets")
    fiscal_year      = models.IntegerField()
    allocated_amount = models.DecimalField(max_digits=15, decimal_places=2)
    utilized_amount  = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = "fin_annual_budgets"
        unique_together = [("cost_center", "fiscal_year")]


# ── Accounting Period ──────────────────────────────────────────────────────────

class PeriodStatus(models.TextChoices):
    OPEN   = "open",   "Open"
    CLOSED = "closed", "Closed"
    LOCKED = "locked", "Locked"

class AccountingPeriod(models.Model):
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    name        = models.CharField(max_length=50)
    start_date  = models.DateField()
    end_date    = models.DateField()
    status      = models.CharField(max_length=10, choices=PeriodStatus.choices, default=PeriodStatus.OPEN)
    closed_by   = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    closed_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "fin_accounting_periods"
        ordering = ["-start_date"]


# ── Journal Entries (double-entry) ────────────────────────────────────────────

class JournalStatus(models.TextChoices):
    DRAFT   = "draft",   "Draft"
    POSTED  = "posted",  "Posted"
    VOIDED  = "voided",  "Voided"

class JournalEntry(models.Model):
    id            = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    period        = models.ForeignKey(AccountingPeriod, on_delete=models.PROTECT, related_name="journals")
    entry_number  = models.CharField(max_length=30, unique=True)
    entry_date    = models.DateField()
    description   = models.TextField()
    source        = models.CharField(max_length=50, blank=True, help_text="billing|payroll|inventory|manual")
    source_ref    = models.CharField(max_length=100, blank=True)
    status        = models.CharField(max_length=10, choices=JournalStatus.choices, default=JournalStatus.DRAFT)
    posted_by     = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="posted_journals")
    posted_at     = models.DateTimeField(null=True, blank=True)
    created_by    = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_journals")
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fin_journal_entries"
        ordering = ["-entry_date"]


class JournalLine(models.Model):
    id          = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    journal     = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name="lines")
    account     = models.ForeignKey(GLAccount, on_delete=models.PROTECT)
    cost_center = models.ForeignKey(CostCenter, null=True, blank=True, on_delete=models.SET_NULL)
    description = models.CharField(max_length=255, blank=True)
    debit       = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit      = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency    = models.CharField(max_length=3, default="SAR")
    fx_rate     = models.DecimalField(max_digits=10, decimal_places=6, default=1)

    class Meta:
        db_table = "fin_journal_lines"


# ── Accounts Payable ───────────────────────────────────────────────────────────

class APStatus(models.TextChoices):
    DRAFT    = "draft",    "Draft"
    APPROVED = "approved", "Approved"
    PAID     = "paid",     "Paid"
    OVERDUE  = "overdue",  "Overdue"
    VOIDED   = "voided",   "Voided"

class APInvoice(models.Model):
    id             = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    vendor_id      = models.UUIDField(help_text="procurement_app.Vendor")
    po_id          = models.UUIDField(null=True, blank=True, help_text="procurement_app.PurchaseOrder")
    invoice_number = models.CharField(max_length=100)
    invoice_date   = models.DateField()
    due_date       = models.DateField()
    subtotal       = models.DecimalField(max_digits=15, decimal_places=2)
    vat_amount     = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total          = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount    = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status         = models.CharField(max_length=15, choices=APStatus.choices, default=APStatus.DRAFT)
    journal        = models.ForeignKey(JournalEntry, null=True, blank=True, on_delete=models.SET_NULL)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fin_ap_invoices"


# ── Accounts Receivable ────────────────────────────────────────────────────────

class ARStatus(models.TextChoices):
    OPEN        = "open",        "Open"
    PARTIAL     = "partial",     "Partial"
    PAID        = "paid",        "Paid"
    BAD_DEBT    = "bad_debt",    "Bad Debt"
    CANCELLED   = "cancelled",   "Cancelled"

class ARInvoice(models.Model):
    id             = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    patient_id     = models.UUIDField(null=True, blank=True)
    insurer_id     = models.UUIDField(null=True, blank=True)
    encounter_id   = models.UUIDField(null=True, blank=True)
    invoice_number = models.CharField(max_length=100, unique=True)
    invoice_date   = models.DateField()
    due_date       = models.DateField()
    subtotal       = models.DecimalField(max_digits=15, decimal_places=2)
    discount       = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    vat_amount     = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total          = models.DecimalField(max_digits=15, decimal_places=2)
    collected      = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status         = models.CharField(max_length=15, choices=ARStatus.choices, default=ARStatus.OPEN)
    journal        = models.ForeignKey(JournalEntry, null=True, blank=True, on_delete=models.SET_NULL)
    zatca_status   = models.CharField(max_length=30, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fin_ar_invoices"


# ── Bank Accounts & Reconciliation ────────────────────────────────────────────

class BankAccount(models.Model):
    id              = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    bank_name       = models.CharField(max_length=100)
    account_name    = models.CharField(max_length=255)
    iban            = models.CharField(max_length=34)
    currency        = models.CharField(max_length=3, default="SAR")
    gl_account      = models.ForeignKey(GLAccount, on_delete=models.PROTECT)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active       = models.BooleanField(default=True)

    class Meta:
        db_table = "fin_bank_accounts"


class BankStatement(models.Model):
    id           = models.UUIDField(primary_key=True, default=_uuid7, editable=False)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name="statements")
    txn_date     = models.DateField()
    description  = models.CharField(max_length=500)
    debit        = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit       = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance      = models.DecimalField(max_digits=15, decimal_places=2)
    reconciled   = models.BooleanField(default=False)
    journal_line = models.ForeignKey(JournalLine, null=True, blank=True, on_delete=models.SET_NULL)
    imported_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fin_bank_statements"
