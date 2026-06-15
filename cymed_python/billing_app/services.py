from django.db import transaction
from django.utils import timezone
from .models import ServiceCharge, Invoice, Payment
import datetime
from decimal import Decimal

class ServiceChargeEngine:
    @staticmethod
    def generate_charge(patient_id, encounter_id, clinical_event_id, service_code, description, quantity, unit_price):
        import uuid
        if not encounter_id:
            encounter_id = uuid.uuid4()
        if not clinical_event_id:
            clinical_event_id = uuid.uuid4()
            
        total_amount = Decimal(quantity) * Decimal(unit_price)
        charge = ServiceCharge.objects.create(
            patient_id=patient_id,
            encounter_id=encounter_id,
            clinical_event_id=clinical_event_id,
            service_code=service_code,
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            status='UNBILLED'
        )
        return charge

class InvoiceGenerationService:
    @staticmethod
    @transaction.atomic
    def generate_invoice(patient_id, encounter_id):
        import uuid
        if not encounter_id:
            encounter_id = uuid.uuid4()
            
        unbilled_charges = ServiceCharge.objects.filter(
            patient_id=patient_id, 
            encounter_id=encounter_id, 
            status='UNBILLED'
        )
        
        if not unbilled_charges.exists():
            return None
            
        total_amount = sum(charge.total_amount for charge in unbilled_charges)
        invoice = Invoice.objects.filter(patient_id=patient_id, encounter_id=encounter_id, status__in=['DRAFT', 'ISSUED']).first()
        if invoice:
            invoice.total_amount += total_amount
            invoice.net_amount += total_amount
            invoice.save()
        else:
            invoice = Invoice.objects.create(
                patient_id=patient_id,
                encounter_id=encounter_id,
                invoice_number=f"INV-{int(timezone.now().timestamp())}-{uuid.uuid4().hex[:6].upper()}",
                total_amount=total_amount,
                net_amount=total_amount,
                status='DRAFT',
                due_date=timezone.now().date() + datetime.timedelta(days=30)
            )
        
        for charge in unbilled_charges:
            charge.invoice = invoice
            charge.status = 'BILLED'
            charge.save()
            
        return invoice

def record_payment(invoice_id, amount, payment_method, reference_number=None):
    with transaction.atomic():
        invoice = Invoice.objects.get(id=invoice_id)
        payment = Payment.objects.create(
            invoice=invoice,
            patient_id=invoice.patient_id,
            amount=Decimal(amount),
            payment_method=payment_method,
            reference_number=reference_number,
            status='COMPLETED'
        )
        
        invoice.amount_paid += Decimal(amount)
        if invoice.amount_paid >= invoice.net_amount:
            invoice.status = 'PAID'
        else:
            invoice.status = 'PARTIAL'
        invoice.save()
        
        return payment

class BillingWorkflowService:
    @staticmethod
    def handle_patient_registration(patient_id, facility_id, user_id):
        from patient_app.models import Encounter
        encounter = Encounter.objects.filter(patient_id=patient_id).order_by('-id').first()
        encounter_id = encounter.id if encounter else None
        
        ServiceChargeEngine.generate_charge(
            patient_id=patient_id,
            encounter_id=encounter_id,
            clinical_event_id=None,
            service_code="REG-001",
            description="Patient Registration Fee",
            quantity=1,
            unit_price=50.00
        )
        InvoiceGenerationService.generate_invoice(patient_id, encounter_id)

    @staticmethod
    def handle_encounter_completed(sender, **kwargs):
        patient_id = kwargs.get('patient_id')
        encounter_id = kwargs.get('encounter_id')
        ServiceChargeEngine.generate_charge(
            patient_id=patient_id,
            encounter_id=encounter_id,
            clinical_event_id=None,
            service_code="CONS-001",
            description="Specialist Consultation",
            quantity=1,
            unit_price=100.00
        )
        InvoiceGenerationService.generate_invoice(patient_id, encounter_id)

    @staticmethod
    def handle_medication_ordered(sender, **kwargs):
        ServiceChargeEngine.generate_charge(
            patient_id=kwargs.get('patient_id'),
            encounter_id=kwargs.get('encounter_id'),
            clinical_event_id=None,
            service_code="PHARM-001",
            description=f"Medication: {kwargs.get('medication_name')}",
            quantity=1,
            unit_price=25.00
        )

    @staticmethod
    def handle_lab_ordered(sender, **kwargs):
        ServiceChargeEngine.generate_charge(
            patient_id=kwargs.get('patient_id'),
            encounter_id=kwargs.get('encounter_id'),
            clinical_event_id=None,
            service_code="LAB-001",
            description=f"Lab: {kwargs.get('panel_name')}",
            quantity=1,
            unit_price=50.00
        )

    @staticmethod
    def handle_radiology_ordered(sender, **kwargs):
        ServiceChargeEngine.generate_charge(
            patient_id=kwargs.get('patient_id'),
            encounter_id=kwargs.get('encounter_id'),
            clinical_event_id=None,
            service_code="RAD-001",
            description=f"Radiology: {kwargs.get('modality')}",
            quantity=1,
            unit_price=150.00
        )

    @staticmethod
    def finalize_invoice(invoice_id):
        invoice = Invoice.objects.get(id=invoice_id)
        invoice.status = 'FINALIZED'
        invoice.save()
        return invoice
