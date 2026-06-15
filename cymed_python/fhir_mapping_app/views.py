"""FHIR R4 REST API endpoints."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from . import fhir_r4


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def capability_statement(request):
    """GET /api/fhir/metadata — FHIR CapabilityStatement."""
    return Response({
        "resourceType": "CapabilityStatement",
        "status": "active",
        "kind": "instance",
        "fhirVersion": "4.0.1",
        "format": ["application/fhir+json"],
        "rest": [{"mode": "server", "resource": [
            {"type": "Patient",     "interaction": [{"code": "read"}]},
            {"type": "Encounter",   "interaction": [{"code": "read"}]},
            {"type": "Observation", "interaction": [{"code": "read"}]},
        ]}],
    }, content_type="application/fhir+json")


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def patient_fhir(request, patient_id: str):
    from patient_app.models import GlobalPatient
    try:
        p = GlobalPatient.objects.get(id=patient_id)
    except GlobalPatient.DoesNotExist:
        return Response({"resourceType": "OperationOutcome"}, status=404)
    return Response(fhir_r4.build_patient(p), content_type="application/fhir+json")


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def encounter_fhir(request, encounter_id: str):
    from admission_app.models import Encounter
    try:
        enc = Encounter.objects.get(id=encounter_id)
    except Encounter.DoesNotExist:
        return Response({"resourceType": "OperationOutcome"}, status=404)
    return Response(fhir_r4.build_encounter(enc, str(enc.patient_id)), content_type="application/fhir+json")


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def patient_everything(request, patient_id: str):
    """$everything — full patient FHIR bundle."""
    from patient_app.models import GlobalPatient
    from admission_app.models import Encounter
    from nursing_app.models import VitalSigns
    try:
        patient = GlobalPatient.objects.get(id=patient_id)
    except GlobalPatient.DoesNotExist:
        return Response({"error": "not found"}, status=404)

    resources = [fhir_r4.build_patient(patient)]
    for enc in Encounter.objects.filter(patient_id=patient_id).order_by("-registered_at")[:20]:
        resources.append(fhir_r4.build_encounter(enc, patient_id))
        for v in VitalSigns.objects.filter(encounter_id=enc.id).order_by("-recorded_at")[:5]:
            resources.extend(fhir_r4.build_observation(v, patient_id, str(enc.id)))

    return Response(fhir_r4.build_bundle(resources), content_type="application/fhir+json")
