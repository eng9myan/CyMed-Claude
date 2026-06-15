import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()


class MedicalCodingRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField(unique=True)
    coder_id = models.UUIDField()
    drg_code = models.CharField(max_length=50, null=True, blank=True)
    primary_diagnosis_code = models.CharField(max_length=50)
    secondary_diagnosis_codes = models.JSONField(default=list)
    procedure_codes = models.JSONField(default=list)
    status = models.CharField(max_length=50) # IN_PROGRESS, REVIEW, CODED
    coded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'rcm_coding_records'

class ClaimLineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim_id = models.UUIDField() # Reference to InsuranceClaim
    service_charge_id = models.UUIDField() # Reference to ServiceCharge
    cpt_code = models.CharField(max_length=50)
    modifiers = models.JSONField(default=list)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    denial_code = models.CharField(max_length=50, null=True, blank=True)
    is_paid = models.BooleanField(default=False)

    class Meta:
        db_table = 'rcm_claim_line_items'

class DenialAppeal(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim_id = models.UUIDField()
    assigned_to = models.UUIDField()
    reason_code = models.CharField(max_length=50)
    appeal_notes = models.TextField()
    status = models.CharField(max_length=50) # PREPARING, SUBMITTED, WON, LOST
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'rcm_denial_appeals'

class InsuranceClaim(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    patient_id = models.UUIDField(null=True, blank=True)
    payer_id = models.UUIDField(null=True, blank=True)
    state = models.CharField(max_length=50, default='DRAFT')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def submit_claim(self):
        from django.utils import timezone
        self.submitted_at = timezone.now()
        self.state = 'SUBMITTED'

    def deny_claim(self):
        self.state = 'DENIED'

    def mark_paid(self):
        self.state = 'PAID'

    class Meta:
        db_table = 'rcm_insurance_claims'

class EOB(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim = models.ForeignKey(InsuranceClaim, on_delete=models.CASCADE, related_name='eobs')
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    patient_responsibility = models.DecimalField(max_digits=12, decimal_places=2)
    denial_reason = models.TextField(null=True, blank=True)
    processed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rcm_eobs'

class CDIQuery(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    coding_record = models.ForeignKey(MedicalCodingRecord, on_delete=models.CASCADE, related_name='cdi_queries')
    physician_id = models.UUIDField()
    coder_id = models.UUIDField()
    query_text = models.TextField()
    physician_response = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default='OPEN') # OPEN, ANSWERED, CLOSED
    created_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'rcm_cdi_queries'

class ICD10Code(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'rcm_icd10_codes'

class CPTCode(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    rvu = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)

    class Meta:
        db_table = 'rcm_cpt_codes'

class DRG(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    weight = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)

    class Meta:
        db_table = 'rcm_drgs'

