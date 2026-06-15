"""Multi-country billing API endpoints."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as drf_status

from cymed_core.country_config import get_country, COUNTRY_REGISTRY, SUPPORTED_COUNTRIES
from .country_billing import submit_claim, check_eligibility, generate_invoice


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_countries(request):
    """List all supported countries with their compliance profiles."""
    result = []
    for code, profile in COUNTRY_REGISTRY.items():
        result.append({
            "code":              profile.code,
            "name":              profile.name,
            "currency":          profile.currency,
            "currency_symbol":   profile.currency_symbol,
            "languages":         profile.languages,
            "rtl":               profile.rtl,
            "billing_standard":  profile.billing_standard,
            "e_invoice":         profile.e_invoice_standard,
            "privacy_law":       profile.privacy_law,
            "accreditation":     profile.accreditation,
            "icd_version":       profile.icd_version,
            "national_id_label": profile.national_id_label,
            "phone_prefix":      profile.phone_prefix,
            "date_format":       profile.date_format,
            "fhir_endpoint":     profile.national_fhir_endpoint,
            "ai_data_residency": profile.ai_data_residency,
        })
    return Response({"supported_countries": len(result), "countries": result})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def country_profile(request, country_code: str):
    """Get full compliance profile for a specific country."""
    profile = get_country(country_code.upper())
    return Response({
        "code":                 profile.code,
        "name":                 profile.name,
        "currency":             profile.currency,
        "currency_symbol":      profile.currency_symbol,
        "languages":            profile.languages,
        "rtl":                  profile.rtl,
        "timezone":             profile.timezone,
        "national_id_label":    profile.national_id_label,
        "national_id_regex":    profile.national_id_regex,
        "health_id_system":     profile.health_id_system,
        "icd_version":          profile.icd_version,
        "drug_formulary":       profile.drug_formulary,
        "lab_units":            profile.lab_units,
        "vital_temp_unit":      profile.vital_temp_unit,
        "billing_standard":     profile.billing_standard,
        "e_invoice_standard":   profile.e_invoice_standard,
        "privacy_law":          profile.privacy_law,
        "accreditation":        profile.accreditation,
        "national_fhir_endpoint": profile.national_fhir_endpoint,
        "national_payer_api":   profile.national_payer_api,
        "tpa_support":          profile.tpa_support,
        "phone_prefix":         profile.phone_prefix,
        "date_format":          profile.date_format,
        "number_format":        profile.number_format,
        "ai_data_residency":    profile.ai_data_residency,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def multi_country_claim(request):
    """
    Submit a claim routed to the correct national billing system.
    Body: { country_code, ...claim_data }
    """
    country_code = request.data.get("country_code", "SA")
    result = submit_claim(dict(request.data), country_code)
    return Response({
        "country":   result.country,
        "standard":  result.standard,
        "status":    result.status,
        "reference": result.reference,
        "message":   result.message,
    }, status=drf_status.HTTP_200_OK if result.status != "error" else drf_status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def multi_country_eligibility(request):
    """Check patient eligibility against the correct national payer API."""
    country_code = request.data.get("country_code", "SA")
    result = check_eligibility(dict(request.data), country_code)
    return Response({
        "country":       result.country,
        "eligible":      result.eligible,
        "coverage_type": result.coverage_type,
        "insurer":       result.insurer,
        "message":       result.message,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def multi_country_invoice(request):
    """Generate country-specific e-invoice (ZATCA / HMRC / IRS / generic)."""
    country_code = request.data.get("country_code", "SA")
    result = generate_invoice(dict(request.data), country_code)
    return Response(result)
