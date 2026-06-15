from ninja import Router, Schema
from uuid import UUID
from .services import ServiceChargeEngine, InvoiceGenerationService, record_payment
from typing import Optional
from decimal import Decimal
from .models import Invoice, ServiceCharge

router = Router(tags=["Billing"])

class PaymentPayload(Schema):
    amount: float
    payment_method: str
    reference_number: Optional[str] = None

@router.post("/invoices/generate")
def api_generate_invoice(request, patient_id: UUID, encounter_id: UUID):
    invoice = InvoiceGenerationService.generate_invoice(patient_id, encounter_id)
    if invoice:
        return {"status": "success", "invoice_id": str(invoice.id)}
    return {"status": "error", "message": "No unbilled charges"}

@router.post("/invoices/{invoice_id}/pay")
def api_pay_invoice(request, invoice_id: UUID, payload: PaymentPayload):
    payment = record_payment(
        invoice_id=invoice_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        reference_number=payload.reference_number
    )
    return {"status": "success", "payment_id": str(payment.id)}

@router.get("/invoices")
def api_list_invoices(request, patient_id: UUID = None):
    queryset = Invoice.objects.all()
    if patient_id:
        queryset = queryset.filter(patient_id=patient_id)
        
    return [
        {
            "id": str(i.id),
            "invoice_number": i.invoice_number,
            "total_amount": float(i.total_amount),
            "amount_paid": float(i.amount_paid),
            "status": i.status,
            "issue_date": i.issue_date.isoformat() if i.issue_date else None
        }
        for i in queryset
    ]
