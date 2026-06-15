import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ZatcaInvoice(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    invoice_id = models.UUIDField(help_text="Reference to billing_app.Invoice")
    zatca_uuid = models.UUIDField(unique=True)
    invoice_hash = models.CharField(max_length=255)
    xml_content = models.TextField()
    qr_code_base64 = models.TextField()
    clearance_status = models.CharField(max_length=50) # PENDING, CLEARED, REJECTED
    clearance_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'zatca_invoices'
