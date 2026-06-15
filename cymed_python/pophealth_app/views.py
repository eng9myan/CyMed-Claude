from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def disease_prevalence(request):
    """ICD-code based disease prevalence counts."""
    from admission_app.models import Admission
    from django.db.models import Count
    icd_code = request.query_params.get("icd_code")
    qs = Admission.objects.values("primary_diagnosis").annotate(count=Count("id")).order_by("-count")
    if icd_code:
        qs = qs.filter(primary_diagnosis__icontains=icd_code)
    return Response(list(qs[:50]))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def readmission_rate(request):
    """30-day readmission rate estimate."""
    from admission_app.models import Admission
    from django.utils import timezone
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    discharged = Admission.objects.filter(
        status="DISCHARGED",
        discharged_at__gte=thirty_days_ago,
    ).count()
    readmitted = Admission.objects.filter(
        admitted_at__gte=thirty_days_ago,
        readmission=True,
    ).count() if hasattr(Admission, "readmission") else 0
    rate = round((readmitted / discharged * 100), 2) if discharged else 0
    return Response({
        "period_days": 30,
        "discharged": discharged,
        "readmitted": readmitted,
        "readmission_rate_pct": rate,
    })
