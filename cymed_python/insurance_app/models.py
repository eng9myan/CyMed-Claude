"""
Insurance & Payer models — shared across all CyMed platforms.
Existing minimal models (InsurancePolicy, InsuranceClaim) preserved for migration history.
Extended models below add Payer, InsurancePlan, Eligibility, PriorAuth, Remittance, Denial.
Routes through billing_app.country_billing for multi-country adjudication.
"""

import uuid6
from django.db import models


def generate_uuidv7():
    return uuid6.uuid7()


# ────────────────────────────────────────────────────────────────────────────
# EXISTING MODELS — preserved as-is so 0001_initial migration still applies
# ────────────────────────────────────────────────────────────────────────────
class InsurancePolicy(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    insurance_provider_id = models.UUIDField(help_text="Reference to External Organization")
    policy_number = models.CharField(max_length=100)
    group_number = models.CharField(max_length=100, null=True, blank=True)
    subscriber_name = models.CharField(max_length=255)
    relationship_to_subscriber = models.CharField(max_length=50)  # SELF, SPOUSE, CHILD
    effective_date = models.DateField()
    expiration_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'insurance_policies'


class InsuranceClaim(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    invoice_id = models.UUIDField(help_text="Reference to Invoice")
    policy = models.ForeignKey(InsurancePolicy, on_delete=models.CASCADE)
    claim_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    total_claim_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50)  # PREPARED, SUBMITTED, DENIED, PAID, PARTIAL
    submitted_at = models.DateTimeField(null=True, blank=True)
    adjudicated_at = models.DateTimeField(null=True, blank=True)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    denial_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'insurance_claims'


# ────────────────────────────────────────────────────────────────────────────
# EXTENDED MODELS — new tables added on top of the existing schema
# ────────────────────────────────────────────────────────────────────────────
class Payer(models.Model):
    """Insurance company / payer entity (Bupa, Tawuniya, NHS, Aetna, etc.)."""

    PAYER_TYPE_CHOICES = [
        ("commercial",  "Commercial / Private"),
        ("government",  "Government / National"),
        ("self_pay",    "Self-Pay"),
        ("worker_comp", "Workers' Compensation"),
        ("auto",        "Auto Insurance"),
        ("tpa",         "Third-Party Administrator"),
    ]

    id           = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name         = models.CharField(max_length=200, db_index=True)
    short_code   = models.CharField(max_length=20, unique=True)
    payer_type   = models.CharField(max_length=20, choices=PAYER_TYPE_CHOICES, default="commercial")
    country_code = models.CharField(max_length=2, help_text="ISO 3166-1 alpha-2")

    standard         = models.CharField(max_length=30, help_text="NPHIES, NHS-ECS, CMS-1500, HAAD, MOH-KW, NHCPS-QA, JFDA, GENERIC")
    portal_url       = models.URLField(blank=True)
    eligibility_url  = models.URLField(blank=True)
    claims_url       = models.URLField(blank=True)
    api_credentials  = models.JSONField(default=dict, blank=True)

    contact_phone = models.CharField(max_length=30, blank=True)
    contact_email = models.EmailField(blank=True)
    network_tier  = models.CharField(max_length=20, blank=True)

    avg_days_to_pay = models.IntegerField(default=30)
    denial_rate_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active       = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insurance_payers"
        indexes = [
            models.Index(fields=["country_code", "is_active"]),
            models.Index(fields=["short_code"]),
        ]


class InsurancePlan(models.Model):
    """Specific plan offered by a payer (e.g. Bupa Platinum, NHS HRG)."""

    PLAN_TYPE_CHOICES = [
        ("hmo",        "HMO"),
        ("ppo",        "PPO"),
        ("epo",        "EPO"),
        ("pos",        "POS"),
        ("hdhp",       "High Deductible Health Plan"),
        ("indemnity",  "Indemnity"),
        ("medicaid",   "Medicaid"),
        ("medicare",   "Medicare"),
        ("national",   "National Health Service"),
        ("self_insure","Employer Self-Insured"),
    ]

    id          = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    payer       = models.ForeignKey(Payer, on_delete=models.CASCADE, related_name="plans")
    name        = models.CharField(max_length=200)
    plan_code   = models.CharField(max_length=50, db_index=True)
    plan_type   = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES)

    deductible_individual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductible_family     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    oop_max_individual    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    oop_max_family        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    copay_pcp             = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    copay_specialist      = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    copay_er              = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    copay_urgent_care     = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    coinsurance_pct       = models.DecimalField(max_digits=5,  decimal_places=2, default=0)

    covers_pharmacy    = models.BooleanField(default=True)
    covers_dental      = models.BooleanField(default=False)
    covers_vision      = models.BooleanField(default=False)
    covers_maternity   = models.BooleanField(default=True)
    covers_mental_hlth = models.BooleanField(default=True)
    covers_telehealth  = models.BooleanField(default=True)

    prior_auth_required = models.JSONField(default=list, blank=True)

    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insurance_plans"
        unique_together = [("payer", "plan_code")]


class PatientPolicy(models.Model):
    """Extended patient policy with priority, eligibility snapshot, card images."""

    RELATION_CHOICES = [
        ("self",   "Self"),
        ("spouse", "Spouse"),
        ("child",  "Child"),
        ("other",  "Other"),
    ]
    PRIORITY_CHOICES = [
        ("primary",   "Primary"),
        ("secondary", "Secondary"),
        ("tertiary",  "Tertiary"),
    ]

    id           = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    plan         = models.ForeignKey(InsurancePlan, on_delete=models.PROTECT, related_name="policies")

    member_id    = models.CharField(max_length=100, db_index=True)
    group_number = models.CharField(max_length=100, blank=True)
    priority     = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="primary")

    subscriber_name = models.CharField(max_length=200, blank=True)
    subscriber_dob  = models.DateField(null=True, blank=True)
    relation_to_subscriber = models.CharField(max_length=10, choices=RELATION_CHOICES, default="self")

    effective_date   = models.DateField()
    termination_date = models.DateField(null=True, blank=True)

    card_front_url = models.URLField(blank=True)
    card_back_url  = models.URLField(blank=True)

    last_eligibility_check = models.DateTimeField(null=True, blank=True)
    eligibility_status     = models.CharField(max_length=20, default="unknown")
    deductible_met         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    oop_met                = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insurance_patient_policies"
        indexes = [
            models.Index(fields=["patient_id", "priority"]),
            models.Index(fields=["member_id"]),
        ]


class EligibilityCheck(models.Model):
    id          = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    policy      = models.ForeignKey(PatientPolicy, on_delete=models.CASCADE, related_name="eligibility_checks")
    requested_at = models.DateTimeField(auto_now_add=True)
    requested_by_user_id = models.UUIDField(null=True, blank=True)
    service_date = models.DateField()
    service_codes = models.JSONField(default=list)

    response_status = models.CharField(max_length=20)
    response_payload = models.JSONField(default=dict)
    is_eligible      = models.BooleanField(default=False)
    estimated_patient_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "insurance_eligibility_checks"
        ordering = ["-requested_at"]


class PriorAuthorization(models.Model):
    STATUS_CHOICES = [
        ("draft",    "Draft"),
        ("submitted","Submitted"),
        ("pending",  "Pending Review"),
        ("approved", "Approved"),
        ("denied",   "Denied"),
        ("expired",  "Expired"),
        ("appealed", "Appealed"),
    ]

    id           = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    policy       = models.ForeignKey(PatientPolicy, on_delete=models.CASCADE, related_name="prior_auths")
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)

    service_code        = models.CharField(max_length=50)
    service_description = models.CharField(max_length=500)
    diagnosis_codes     = models.JSONField(default=list)
    requesting_provider_id = models.UUIDField()
    clinical_notes      = models.TextField(blank=True)

    submitted_at = models.DateTimeField(null=True, blank=True)
    response_at  = models.DateTimeField(null=True, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    auth_number  = models.CharField(max_length=100, blank=True, db_index=True)
    valid_from   = models.DateField(null=True, blank=True)
    valid_to     = models.DateField(null=True, blank=True)
    approved_units = models.IntegerField(null=True, blank=True)

    denial_reason   = models.CharField(max_length=500, blank=True)
    appeal_deadline = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insurance_prior_auths"
        ordering = ["-created_at"]


class ClaimExtended(models.Model):
    """Extended claim with line items, denial codes, financial detail. Coexists with InsuranceClaim."""

    STATUS_CHOICES = [
        ("draft",      "Draft"),
        ("submitted",  "Submitted"),
        ("acknowledged","Acknowledged"),
        ("adjudicated","Adjudicated"),
        ("paid",       "Paid"),
        ("partial",    "Partial"),
        ("denied",     "Denied"),
        ("voided",     "Voided"),
        ("appealed",   "Appealed"),
    ]

    id              = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim_number    = models.CharField(max_length=50, unique=True, db_index=True)
    policy          = models.ForeignKey(PatientPolicy, on_delete=models.PROTECT, related_name="ext_claims")
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id    = models.UUIDField(null=True, blank=True, db_index=True)
    invoice_id      = models.UUIDField(null=True, blank=True, db_index=True)

    service_date_from = models.DateField()
    service_date_to   = models.DateField()
    diagnosis_codes   = models.JSONField(default=list)
    line_items        = models.JSONField(default=list)

    billed_amount     = models.DecimalField(max_digits=12, decimal_places=2)
    allowed_amount    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    patient_responsibility = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    adjustment_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    submitted_at   = models.DateTimeField(null=True, blank=True)
    adjudicated_at = models.DateTimeField(null=True, blank=True)
    paid_at        = models.DateTimeField(null=True, blank=True)

    payer_claim_id     = models.CharField(max_length=100, blank=True, db_index=True)
    submission_payload = models.JSONField(default=dict)
    response_payload   = models.JSONField(default=dict)

    denial_codes    = models.JSONField(default=list)
    denial_reason   = models.TextField(blank=True)
    is_appealable   = models.BooleanField(default=False)
    appeal_deadline = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insurance_claims_extended"
        ordering = ["-created_at"]


class Remittance(models.Model):
    id            = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim         = models.ForeignKey(ClaimExtended, on_delete=models.CASCADE, related_name="remittances")
    remittance_number = models.CharField(max_length=100, db_index=True)
    payer_id      = models.CharField(max_length=100)
    received_at   = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, default="eft")
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    check_number  = models.CharField(max_length=50, blank=True)
    eft_trace     = models.CharField(max_length=100, blank=True)
    raw_835       = models.TextField(blank=True)

    class Meta:
        db_table = "insurance_remittances"


class ClaimDenial(models.Model):
    WORK_STATUS_CHOICES = [
        ("new",        "New"),
        ("reviewing",  "Under Review"),
        ("corrected",  "Corrected & Resubmitted"),
        ("appealing",  "Appeal in Progress"),
        ("written_off","Written Off"),
        ("recovered",  "Recovered"),
    ]

    id            = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim         = models.ForeignKey(ClaimExtended, on_delete=models.CASCADE, related_name="denials")
    denied_amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason_code   = models.CharField(max_length=20)
    reason_text   = models.CharField(max_length=500)
    category      = models.CharField(max_length=50)

    work_status   = models.CharField(max_length=20, choices=WORK_STATUS_CHOICES, default="new")
    assigned_to_user_id = models.UUIDField(null=True, blank=True)
    notes         = models.TextField(blank=True)

    appeal_filed_at  = models.DateTimeField(null=True, blank=True)
    appeal_outcome   = models.CharField(max_length=50, blank=True)
    recovered_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "insurance_claim_denials"
        ordering = ["-created_at"]
