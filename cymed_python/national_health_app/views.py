from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def moh_summary(request):
    """Ministry of Health summary statistics."""
    from patient_app.models import Patient
    from admission_app.models import Admission
    return Response({
        "report_date": str(timezone.localdate()),
        "total_registered_patients": Patient.objects.count(),
        "active_admissions": Admission.objects.filter(status__in=["ADMITTED", "IN_PROGRESS"]).count(),
        "data_residency": "MENA",
        "standard": "MOH-KSA",
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def submit_moh_report(request):
    """Stub: submit monthly MOH statistical report."""
    return Response({
        "status": "submitted",
        "reference": f"MOH-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        "message": "Report queued for MOH submission.",
    })
