from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from .nphies import check_eligibility, submit_pre_auth, submit_claim, appeal_denial


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def eligibility(request):
    result = check_eligibility(
        patient_national_id = request.data.get("national_id", ""),
        insurance_member_id = request.data.get("member_id", ""),
        payer_id            = request.data.get("payer_id", ""),
        facility_nphies_id  = request.data.get("facility_nphies_id", ""),
        service_date        = request.data.get("service_date", ""),
    )
    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def pre_auth(request):
    result = submit_pre_auth(
        claim_data         = request.data.get("claim", {}),
        facility_nphies_id = request.data.get("facility_nphies_id", ""),
    )
    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def claim(request):
    result = submit_claim(
        claim_data         = request.data.get("claim", {}),
        facility_nphies_id = request.data.get("facility_nphies_id", ""),
    )
    return Response(result)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def denial_appeal(request):
    result = appeal_denial(
        original_claim_id  = request.data.get("claim_id", ""),
        denial_code        = request.data.get("denial_code", ""),
        appeal_reason      = request.data.get("reason", ""),
        supporting_docs    = request.data.get("docs", []),
        facility_nphies_id = request.data.get("facility_nphies_id", ""),
    )
    return Response(result)


urlpatterns = [
    path("eligibility/", eligibility,    name="nphies-eligibility"),
    path("preauth/",     pre_auth,        name="nphies-preauth"),
    path("claim/",       claim,           name="nphies-claim"),
    path("appeal/",      denial_appeal,   name="nphies-appeal"),
]
