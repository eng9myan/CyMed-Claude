"""
CyMed Consent Management Platform
Patient-controlled access to all health data across the network.
"""
import uuid6
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


def gen_uuid():
    return uuid6.uuid7()


class ConsentPurpose(models.TextChoices):
    TREATMENT       = "treatment",       "Clinical Treatment"
    PAYMENT         = "payment",         "Payment Processing"
    OPERATIONS      = "operations",      "Healthcare Operations"
    RESEARCH        = "research",        "Research"
    PUBLIC_HEALTH   = "public_health",   "Public Health"
    MARKETING       = "marketing",       "Marketing"
    LEGAL           = "legal",           "Legal / Compliance"


class ConsentScope(models.TextChoices):
    DEMOGRAPHICS   = "demographics",    "Demographics Only"
    MEDICATIONS    = "medications",     "Medications"
    LABORATORY     = "laboratory",      "Laboratory Results"
    IMAGING        = "imaging",         "Imaging / Radiology"
    CLINICAL_NOTES = "clinical_notes",  "Clinical Notes"
    DIAGNOSES      = "diagnoses",       "Diagnoses & Problems"
    PROCEDURES     = "procedures",      "Procedures"
    BILLING        = "billing",         "Billing & Claims"
    FULL_RECORD    = "full_record",     "Full Health Record"


class ConsentStatus(models.TextChoices):
    ACTIVE    = "active",    "Active"
    REVOKED   = "revoked",   "Revoked"
    EXPIRED   = "expired",   "Expired"
    SUSPENDED = "suspended", "Suspended"
    PENDING   = "pending",   "Pending Patient Approval"


class ConsentGrant(models.Model):
    """A patient's explicit consent grant to a provider / facility / organization."""

    id              = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id      = models.UUIDField(db_index=True, help_text="GlobalPatient.id")
    granted_by      = models.UUIDField(help_text="User who granted (patient or representative)")
    granted_to_type = models.CharField(max_length=40, choices=[
        ("provider", "Individual Provider"),
        ("facility", "Facility"),
        ("department", "Department"),
        ("organization", "Organization"),
        ("lab", "Laboratory"),
        ("pharmacy", "Pharmacy"),
        ("imaging", "Imaging Center"),
        ("insurance", "Insurance"),
        ("researcher", "Researcher"),
        ("representative", "Authorized Representative"),
    ])
    granted_to_id   = models.UUIDField(db_index=True, help_text="ID of the grantee entity")
    granted_to_name = models.CharField(max_length=255)

    purpose         = models.CharField(max_length=40, choices=ConsentPurpose.choices, default=ConsentPurpose.TREATMENT)
    scopes          = models.JSONField(default=list, help_text="List of ConsentScope values")
    status          = models.CharField(max_length=20, choices=ConsentStatus.choices, default=ConsentStatus.ACTIVE)

    # Time bounds
    valid_from      = models.DateTimeField(auto_now_add=True)
    valid_until     = models.DateTimeField(null=True, blank=True, help_text="Null = permanent")
    episode_id      = models.UUIDField(null=True, blank=True, help_text="Episode-scoped consent if set")

    # Metadata
    is_emergency    = models.BooleanField(default=False)
    patient_signature = models.TextField(null=True, blank=True, help_text="Base64 digital signature")
    ip_address      = models.GenericIPAddressField(null=True, blank=True)
    user_agent      = models.TextField(null=True, blank=True)
    notes           = models.TextField(blank=True)

    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "consent_grants"
        indexes  = [
            models.Index(fields=["patient_id", "status"]),
            models.Index(fields=["granted_to_id", "granted_to_type"]),
            models.Index(fields=["patient_id", "granted_to_id"]),
        ]

    def __str__(self):
        return f"Consent {self.patient_id} → {self.granted_to_type}:{self.granted_to_id} [{self.status}]"

    def has_scope(self, scope: str) -> bool:
        return scope in self.scopes or ConsentScope.FULL_RECORD in self.scopes

    def is_valid(self) -> bool:
        from django.utils import timezone
        if self.status != ConsentStatus.ACTIVE:
            return False
        if self.valid_until and self.valid_until < timezone.now():
            return False
        return True


class ConsentRevocation(models.Model):
    """Audit record when a consent is revoked."""

    id          = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    consent     = models.ForeignKey(ConsentGrant, on_delete=models.CASCADE, related_name="revocations")
    revoked_by  = models.UUIDField()
    reason      = models.TextField()
    revoked_at  = models.DateTimeField(auto_now_add=True)
    notified    = models.BooleanField(default=False)

    class Meta:
        db_table = "consent_revocations"


class AuthorizedRepresentative(models.Model):
    """A person authorized to act on behalf of the patient."""

    RELATIONSHIP_CHOICES = [
        ("parent",           "Parent"),
        ("guardian",         "Legal Guardian"),
        ("spouse",           "Spouse"),
        ("child",            "Child"),
        ("sibling",          "Sibling"),
        ("emergency_contact","Emergency Contact"),
        ("legal_rep",        "Legal Representative"),
        ("healthcare_proxy", "Healthcare Proxy"),
        ("power_of_attorney","Power of Attorney"),
    ]

    id             = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    representative_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name           = models.CharField(max_length=255)
    relationship   = models.CharField(max_length=40, choices=RELATIONSHIP_CHOICES)
    phone          = models.CharField(max_length=30, blank=True)
    email          = models.EmailField(blank=True)
    national_id    = models.CharField(max_length=50, blank=True)
    can_grant_consent  = models.BooleanField(default=False)
    can_view_record    = models.BooleanField(default=True)
    can_make_decisions = models.BooleanField(default=False)
    active         = models.BooleanField(default=True)
    valid_from     = models.DateField(auto_now_add=True)
    valid_until    = models.DateField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "authorized_representatives"
        indexes  = [models.Index(fields=["patient_id", "active"])]


class BreakGlassAccess(models.Model):
    """Emergency override access — requires justification, audit, notification."""

    JUSTIFICATION_CHOICES = [
        ("unconscious",    "Patient Unconscious"),
        ("incapacitated",  "Patient Incapacitated"),
        ("no_rep",         "No Representative Available"),
        ("mass_casualty",  "Mass Casualty Event"),
        ("imminent_death", "Imminent Risk of Death"),
        ("other",          "Other — See Notes"),
    ]

    id              = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    accessed_by     = models.ForeignKey(User, on_delete=models.CASCADE, related_name="break_glass_events")
    facility_id = models.UUIDField(null=True, blank=True)
    justification   = models.CharField(max_length=40, choices=JUSTIFICATION_CHOICES)
    notes           = models.TextField(help_text="Required: detailed justification")
    scopes_accessed = models.JSONField(default=list)
    access_start    = models.DateTimeField(auto_now_add=True)
    access_end      = models.DateTimeField(null=True, blank=True)
    # Governance
    patient_notified    = models.BooleanField(default=False)
    notification_sent_at= models.DateTimeField(null=True, blank=True)
    reviewed            = models.BooleanField(default=False)
    reviewed_by         = models.UUIDField(null=True, blank=True)
    reviewed_at         = models.DateTimeField(null=True, blank=True)
    review_outcome      = models.CharField(max_length=20, choices=[
        ("justified",   "Access Justified"),
        ("unjustified", "Access Unjustified — Action Required"),
        ("pending",     "Pending Review"),
    ], default="pending")
    ip_address      = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table  = "break_glass_access"
        indexes   = [models.Index(fields=["patient_id"]), models.Index(fields=["reviewed", "review_outcome"])]

    def __str__(self):
        return f"BreakGlass: {self.accessed_by} → patient:{self.patient_id} [{self.justification}]"


class ConsentAccessLog(models.Model):
    """Immutable audit log: every access to patient data is logged."""

    id              = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    consent         = models.ForeignKey(ConsentGrant, on_delete=models.SET_NULL, null=True, blank=True)
    break_glass     = models.ForeignKey(BreakGlassAccess, on_delete=models.SET_NULL, null=True, blank=True)
    accessed_by     = models.UUIDField()
    accessed_by_type= models.CharField(max_length=40)  # provider, nurse, admin…
    access_type     = models.CharField(max_length=40)   # read, write, print, export…
    resource_type   = models.CharField(max_length=80)   # Patient, MedicationRequest…
    resource_id     = models.UUIDField(null=True, blank=True)
    scope_used      = models.CharField(max_length=40, blank=True)
    facility_id     = models.UUIDField(null=True, blank=True)
    ip_address      = models.GenericIPAddressField(null=True, blank=True)
    timestamp       = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "consent_access_logs"
        indexes  = [
            models.Index(fields=["patient_id", "timestamp"]),
            models.Index(fields=["accessed_by", "timestamp"]),
        ]

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValueError("ConsentAccessLog records are immutable — cannot update audit logs.")
        super().save(*args, **kwargs)
