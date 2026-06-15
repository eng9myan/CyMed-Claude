"""
ZATCA Phase 2 e-Invoicing Compliance (Saudi Arabia)
- Generates UBL 2.1 XML invoices
- Applies QR Code (TLV Base64)
- XML Digital Signature (XMLDSig)
- CSID / PCSID management
"""
from __future__ import annotations

import base64
import hashlib
import logging
import os
import struct
from datetime import datetime
from decimal import Decimal
from typing import Any

log = logging.getLogger("zatca")

ZATCA_SANDBOX_URL = "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal"
ZATCA_PROD_URL    = "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"


def generate_invoice_xml(invoice: dict) -> str:
    """
    Build UBL 2.1 XML for a ZATCA-compliant e-invoice.
    invoice dict keys: invoice_number, issue_date, seller, buyer, line_items,
                       vat_number, tax_total, payable_amount, invoice_type
    """
    issue_date = invoice.get("issue_date", datetime.now().strftime("%Y-%m-%d"))
    issue_time = invoice.get("issue_time", datetime.now().strftime("%H:%M:%S"))
    inv_type   = invoice.get("invoice_type", "388")  # 388=Standard, 381=Debit, 383=Credit

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:ext:XMLDSIG</ext:ExtensionURI>
      <ext:ExtensionContent>
        <!-- Signature placeholder — populated by signing service -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>{invoice.get("invoice_number", "")}</cbc:ID>
  <cbc:UUID>{invoice.get("uuid", "")}</cbc:UUID>
  <cbc:IssueDate>{issue_date}</cbc:IssueDate>
  <cbc:IssueTime>{issue_time}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="{_invoice_type_name(inv_type)}">{inv_type}</cbc:InvoiceTypeCode>
  <cbc:Note languageID="ar">{invoice.get("note_ar", "")}</cbc:Note>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  {_build_seller_xml(invoice.get("seller", {}))}
  {_build_buyer_xml(invoice.get("buyer", {}))}
  {_build_tax_total_xml(invoice.get("tax_total", 0), invoice.get("vat_number", ""))}
  {_build_legal_total_xml(invoice)}
  {_build_line_items_xml(invoice.get("line_items", []))}
</Invoice>"""
    return xml


def generate_qr_code(
    seller_name: str,
    vat_number: str,
    timestamp: str,
    invoice_total: Decimal,
    vat_total: Decimal,
) -> str:
    """Generate ZATCA QR Code (TLV encoding, Base64)."""
    def tlv(tag: int, value: str) -> bytes:
        encoded = value.encode("utf-8")
        return bytes([tag, len(encoded)]) + encoded

    tlv_data = (
        tlv(1, seller_name) +
        tlv(2, vat_number) +
        tlv(3, timestamp) +
        tlv(4, f"{invoice_total:.2f}") +
        tlv(5, f"{vat_total:.2f}")
    )
    return base64.b64encode(tlv_data).decode("ascii")


def compute_invoice_hash(xml_content: str) -> str:
    """SHA-256 hash of invoice XML for signing."""
    return base64.b64encode(
        hashlib.sha256(xml_content.encode("utf-8")).digest()
    ).decode("ascii")


def submit_invoice(xml_content: str, invoice_hash: str) -> dict:
    """
    Submit to ZATCA Reporting/Clearance API.
    Returns {status, warnings, errors, clearance_status}.
    """
    import requests

    csid       = os.environ.get("ZATCA_CSID", "")
    secret     = os.environ.get("ZATCA_SECRET", "")
    is_prod    = os.environ.get("ZATCA_ENV", "sandbox") == "production"
    base_url   = ZATCA_PROD_URL if is_prod else ZATCA_SANDBOX_URL

    headers = {
        "accept":               "application/json",
        "accept-language":      "en",
        "Accept-Version":       "V2",
        "Authorization":        f"Basic {base64.b64encode(f'{csid}:{secret}'.encode()).decode()}",
        "Content-Type":         "application/json",
    }
    payload = {
        "invoiceHash": invoice_hash,
        "uuid":        _extract_uuid_from_xml(xml_content),
        "invoice":     base64.b64encode(xml_content.encode()).decode(),
    }
    try:
        resp = requests.post(
            f"{base_url}/invoices/reporting/single",
            json=payload, headers=headers, timeout=30
        )
        return resp.json()
    except Exception as exc:
        log.error("ZATCA submission failed: %s", exc)
        return {"status": "error", "message": str(exc)}


# ── Private helpers ───────────────────────────────────────────────────────────

def _invoice_type_name(code: str) -> str:
    return {"388": "0100000", "381": "0100000", "383": "0100000"}.get(code, "0100000")


def _build_seller_xml(seller: dict) -> str:
    return f"""
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>{seller.get("name","")}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>{seller.get("street","")}</cbc:StreetName>
        <cbc:CityName>{seller.get("city","")}</cbc:CityName>
        <cbc:CountrySubentity>{seller.get("region","")}</cbc:CountrySubentity>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>{seller.get("vat_number","")}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>"""


def _build_buyer_xml(buyer: dict) -> str:
    return f"""
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>{buyer.get("name","")}</cbc:Name></cac:PartyName>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">{buyer.get("id","")}</cbc:ID>
      </cac:PartyIdentification>
    </cac:Party>
  </cac:AccountingCustomerParty>"""


def _build_tax_total_xml(tax_total, vat_number: str) -> str:
    return f"""
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">{Decimal(str(tax_total)):.2f}</cbc:TaxAmount>
  </cac:TaxTotal>"""


def _build_legal_total_xml(invoice: dict) -> str:
    subtotal  = Decimal(str(invoice.get("subtotal", 0)))
    tax_total = Decimal(str(invoice.get("tax_total", 0)))
    total     = Decimal(str(invoice.get("payable_amount", subtotal + tax_total)))
    return f"""
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">{subtotal:.2f}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">{subtotal:.2f}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">{total:.2f}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">{total:.2f}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>"""


def _build_line_items_xml(items: list[dict]) -> str:
    lines = []
    for i, item in enumerate(items, 1):
        unit_price = Decimal(str(item.get("unit_price", 0)))
        qty        = Decimal(str(item.get("quantity", 1)))
        line_total = unit_price * qty
        vat_pct    = Decimal(str(item.get("vat_pct", 15)))
        vat_amount = line_total * vat_pct / 100
        lines.append(f"""
  <cac:InvoiceLine>
    <cbc:ID>{i}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">{qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">{line_total:.2f}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="SAR">{vat_amount:.2f}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="SAR">{line_total:.2f}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="SAR">{vat_amount:.2f}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>{vat_pct}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>{item.get("description","")}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">{unit_price:.2f}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>""")
    return "\n".join(lines)


def _extract_uuid_from_xml(xml: str) -> str:
    import re
    m = re.search(r"<cbc:UUID>(.*?)</cbc:UUID>", xml)
    return m.group(1) if m else ""
