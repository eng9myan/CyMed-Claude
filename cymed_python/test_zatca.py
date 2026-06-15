import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from zatca_compliance.services import ZatcaClearanceEngine

print("Testing ZATCA Clearance Engine...")
engine = ZatcaClearanceEngine()
record = engine.clear_invoice(uuid.uuid4(), 1150.00, 150.00)
print("QR Code:", record.qr_code_base64)
