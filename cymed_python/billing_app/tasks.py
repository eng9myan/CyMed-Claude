from celery import shared_task
from .models import ServiceCharge, Invoice
from django.db.models import Sum
from datetime import date, timedelta

@shared_task
def generate_daily_invoices():
    """
    Background job to aggregate unbilled service charges into Invoices.
    Runs nightly.
    """
    unbilled_charges = ServiceCharge.objects.filter(status='UNBILLED')
    
    # Group by patient & encounter
    patient_encounters = unbilled_charges.values('patient_id', 'encounter_id').distinct()
    
    invoices_created = 0
    for pe in patient_encounters:
        charges = unbilled_charges.filter(patient_id=pe['patient_id'], encounter_id=pe['encounter_id'])
        total = charges.aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
        
        if total > 0:
            invoice = Invoice.objects.create(
                patient_id=pe['patient_id'],
                encounter_id=pe['encounter_id'],
                invoice_number=f"INV-{date.today().strftime('%Y%m%d')}-{pe['patient_id'][:4]}",
                total_amount=total,
                net_amount=total,
                status='DRAFT',
                due_date=date.today() + timedelta(days=30)
            )
            charges.update(status='BILLED')
            invoices_created += 1
            
    return {"status": "success", "invoices_created": invoices_created}
