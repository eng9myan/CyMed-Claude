import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ServiceCharge(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    invoice = models.ForeignKey('Invoice', null=True, blank=True, on_delete=models.SET_NULL, related_name='servicecharge_set')
    patient_id = models.UUIDField(null=True, blank=True)
    encounter_id = models.UUIDField()
    clinical_event_id = models.UUIDField(help_text="Reference to LabResult, MedicationAdministration, etc.")
    service_code = models.CharField(max_length=50, help_text="Billing Code (e.g. CPT)")
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50) # UNBILLED, BILLED, PAID, VOIDED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'billing_charges'

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    encounter_id = models.UUIDField()
    invoice_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50) # DRAFT, ISSUED, PARTIAL, PAID, CANCELLED
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()

    class Meta:
        db_table = 'billing_invoices'

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    patient_id = models.UUIDField(null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50) # CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE
    reference_number = models.CharField(max_length=100, null=True, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50) # PENDING, COMPLETED, FAILED, REFUNDED

    class Meta:
        db_table = 'billing_payments'
