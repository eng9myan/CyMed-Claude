import hashlib
import base64
import uuid
from datetime import datetime
from .models import ZatcaInvoice

class ZatcaClearanceEngine:
    """
    Mock integration for ZATCA (Zakat, Tax and Customs Authority) Saudi e-Invoicing Phase 2.
    """
    
    def generate_invoice_hash(self, xml_content: str) -> str:
        """Generates SHA-256 hash of the simplified invoice."""
        return hashlib.sha256(xml_content.encode('utf-8')).hexdigest()
        
    def generate_qr_code(self, seller_name: str, vat_number: str, timestamp: str, total: str, vat_total: str) -> str:
        """Generates TLV (Tag-Length-Value) Base64 QR code per ZATCA spec."""
        # Mocking the TLV encoding
        payload = f"1|{seller_name}|2|{vat_number}|3|{timestamp}|4|{total}|5|{vat_total}"
        return base64.b64encode(payload.encode('utf-8')).decode('utf-8')
        
    def clear_invoice(self, invoice_id: uuid.UUID, total_amount: float, vat_amount: float):
        """
        Simulates signing, stamping, and clearing an invoice with ZATCA APIs.
        """
        xml_mock = f"<Invoice><ID>{invoice_id}</ID><Total>{total_amount}</Total></Invoice>"
        inv_hash = self.generate_invoice_hash(xml_mock)
        qr_base64 = self.generate_qr_code("CyMed Hospital", "300000000000003", datetime.now().isoformat(), str(total_amount), str(vat_amount))
        
        zatca_record = ZatcaInvoice.objects.create(
            invoice_id=invoice_id,
            zatca_uuid=uuid.uuid4(),
            invoice_hash=inv_hash,
            xml_content=xml_mock,
            qr_code_base64=qr_base64,
            clearance_status="CLEARED",
            clearance_date=datetime.now()
        )
        
        print(f"[ZATCA] Invoice {invoice_id} cleared successfully. Hash: {inv_hash}")
        return zatca_record
