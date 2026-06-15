from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from .zatca_service import generate_invoice_xml, generate_qr_code, compute_invoice_hash, submit_invoice
from decimal import Decimal


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def generate_invoice(request):
    """Generate ZATCA UBL XML + QR code for an invoice."""
    data     = request.data
    xml      = generate_invoice_xml(data)
    inv_hash = compute_invoice_hash(xml)
    seller   = data.get("seller", {})
    qr       = generate_qr_code(
        seller_name  = seller.get("name", ""),
        vat_number   = seller.get("vat_number", ""),
        timestamp    = data.get("issue_date", "") + "T" + data.get("issue_time", "00:00:00"),
        invoice_total= Decimal(str(data.get("payable_amount", 0))),
        vat_total    = Decimal(str(data.get("tax_total", 0))),
    )
    return Response({"xml": xml, "hash": inv_hash, "qr_code": qr})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit(request):
    """Submit invoice to ZATCA Reporting API."""
    xml  = request.data.get("xml", "")
    hash_= request.data.get("hash", "")
    result = submit_invoice(xml, hash_)
    return Response(result)


urlpatterns = [
    path("generate/", generate_invoice, name="zatca-generate"),
    path("submit/",   submit,           name="zatca-submit"),
]
