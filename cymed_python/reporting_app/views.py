from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def census_report(request):
    """Daily patient census snapshot."""
    from admission_app.models import Admission
    today = timezone.localdate()
    active = Admission.objects.filter(status__in=["ADMITTED", "IN_PROGRESS"]).count()
    admitted_today = Admission.objects.filter(admitted_at__date=today).count()
    return Response({
        "date": str(today),
        "active_inpatients": active,
        "admitted_today": admitted_today,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lab_tat_report(request):
    """Lab turnaround time summary."""
    from lab_app.models import LabOrder
    from django.db.models import Avg, Count
    stats = LabOrder.objects.filter(status="COMPLETED").aggregate(
        total=Count("id"),
    )
    return Response({"total_completed": stats["total"]})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def financial_summary(request):
    """High-level financial KPIs."""
    from billing_app.models import Invoice, Payment
    from django.db.models import Sum
    total_invoiced = Invoice.objects.aggregate(t=Sum("total_amount"))["t"] or 0
    total_paid = Payment.objects.aggregate(t=Sum("amount"))["t"] or 0
    return Response({
        "total_invoiced": float(total_invoiced),
        "total_collected": float(total_paid),
        "collection_rate": round(float(total_paid) / float(total_invoiced) * 100, 2) if total_invoiced else 0,
    })
