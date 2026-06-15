from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from . import executive_api


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def ai_complete(request):
    from ai_platform.gateway import complete as gw_complete
    result = gw_complete(
        messages=request.data.get("messages", []),
        system=request.data.get("system", ""),
        max_tokens=request.data.get("max_tokens", 1024),
        use_case=request.data.get("use_case", "general"),
        user_id=str(request.user.id),
    )
    return Response(result.to_dict())


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def soap_from_transcription(request):
    from ai_platform.ambient_doc import transcription_to_soap
    return Response({"soap_note": transcription_to_soap(
        request.data.get("transcription", ""),
        patient_context=request.data.get("patient_context"),
    )})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def extract_orders(request):
    from ai_platform.ambient_doc import extract_orders_from_soap
    return Response(extract_orders_from_soap(request.data.get("soap_note", "")))


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def check_order_cds(request):
    from cds_app.cpoe import check_order
    d      = request.data
    result = check_order(
        patient_id  = d.get("patient_id"),
        encounter_id= d.get("encounter_id"),
        drug_name   = d.get("drug_name", ""),
        dose_mg     = float(d.get("dose_mg", 0)),
        route       = d.get("route", ""),
        frequency   = d.get("frequency", ""),
        current_meds= d.get("current_meds", []),
        allergies   = d.get("allergies", []),
        egfr        = d.get("egfr"),
        weight_kg   = d.get("weight_kg"),
    )
    return Response({
        "passed":     result.passed,
        "hard_stops": [{"code": a.code, "title": a.title, "message": a.message} for a in result.hard_stops],
        "soft_stops": [{"code": a.code, "title": a.title, "message": a.message} for a in result.soft_stops],
        "infos":      [{"code": a.code, "title": a.title, "message": a.message} for a in result.infos],
    })


urlpatterns = [
    path("complete/",           ai_complete,                        name="ai-complete"),
    path("soap/",               soap_from_transcription,            name="ai-soap"),
    path("orders/extract/",     extract_orders,                     name="ai-extract-orders"),
    path("orders/cds-check/",   check_order_cds,                    name="ai-cds-check"),
    path("executive/briefing/", executive_api.daily_briefing,       name="ai-executive-briefing"),
    path("executive/kpis/",     executive_api.kpi_snapshot_view,    name="ai-executive-kpis"),
]
