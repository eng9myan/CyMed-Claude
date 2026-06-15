from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ImagingOrder, ImagingStudy, ImagingReport
from .serializers import (
    ImagingOrderSerializer, ImagingOrderWriteSerializer,
    ImagingStudySerializer, ImagingReportSerializer,
)


class ImagingOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ImagingOrder.objects.select_related("study").order_by("-ordered_at")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ImagingOrderWriteSerializer
        return ImagingOrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get("patient_id")
        modality = self.request.query_params.get("modality")
        order_status = self.request.query_params.get("status")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if modality:
            qs = qs.filter(modality=modality.upper())
        if order_status:
            qs = qs.filter(status=order_status.upper())
        return qs

    @action(detail=True, methods=["post"], url_path="perform")
    def perform_study(self, request, pk=None):
        order = self.get_object()
        study, created = ImagingStudy.objects.get_or_create(
            order=order,
            defaults={
                "performed_by": request.user.id,
                "dicom_study_uid": request.data.get("dicom_study_uid"),
                "pacs_url": request.data.get("pacs_url"),
            },
        )
        order.status = "IMAGING"
        order.save(update_fields=["status"])
        return Response(ImagingStudySerializer(study).data,
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=["get", "post"], url_path="report")
    def report(self, request, pk=None):
        order = self.get_object()
        if request.method == "GET":
            try:
                return Response(ImagingReportSerializer(order.study.report).data)
            except (ImagingStudy.DoesNotExist, ImagingReport.DoesNotExist):
                return Response({"detail": "No report yet."}, status=status.HTTP_404_NOT_FOUND)

        study = getattr(order, "study", None)
        if not study:
            return Response({"detail": "Study not performed yet."}, status=status.HTTP_400_BAD_REQUEST)

        report, created = ImagingReport.objects.update_or_create(
            study=study,
            defaults={
                "radiologist_id": request.user.id,
                "findings": request.data.get("findings", ""),
                "impression": request.data.get("impression", ""),
                "ai_pre_read": request.data.get("ai_pre_read"),
                "status": request.data.get("status", "PRELIMINARY"),
                "finalized_at": timezone.now() if request.data.get("status") == "FINAL" else None,
            },
        )
        order.status = "INTERPRETATION"
        order.save(update_fields=["status"])
        return Response(ImagingReportSerializer(report).data,
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        order = self.get_object()
        order.status = "COMPLETED"
        order.save(update_fields=["status"])
        if hasattr(order, "study") and hasattr(order.study, "report"):
            order.study.report.status = "FINAL"
            order.study.report.finalized_at = timezone.now()
            order.study.report.save(update_fields=["status", "finalized_at"])
        return Response({"detail": "Imaging order completed."})

    @action(detail=False, methods=["get"], url_path="worklist")
    def worklist(self, request):
        qs = self.get_queryset().exclude(status__in=["COMPLETED", "CANCELLED"])
        return Response(ImagingOrderSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path="stat")
    def stat_orders(self, request):
        qs = self.get_queryset().filter(priority="STAT").exclude(status="COMPLETED")
        return Response(ImagingOrderSerializer(qs, many=True).data)
