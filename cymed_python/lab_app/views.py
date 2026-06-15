from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LabOrder, LabPanel, LabSpecimen, LabResult
from .serializers import (
    LabOrderSerializer, LabOrderWriteSerializer,
    LabPanelSerializer, LabSpecimenSerializer, LabResultSerializer,
)


class LabOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = LabOrder.objects.prefetch_related("specimens", "results").order_by("-ordered_at")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return LabOrderWriteSerializer
        return LabOrderSerializer

    @action(detail=True, methods=["post"], url_path="collect")
    def collect_specimen(self, request, pk=None):
        order = self.get_object()
        specimen = LabSpecimen.objects.create(
            lab_order=order,
            specimen_type=request.data.get("specimen_type", "BLOOD"),
            barcode=request.data.get("barcode"),
            collected_by=request.user.id,
        )
        order.status = "COLLECTED"
        order.save(update_fields=["status"])
        return Response(LabSpecimenSerializer(specimen).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="result")
    def enter_result(self, request, pk=None):
        order = self.get_object()
        result = LabResult.objects.create(
            lab_order=order,
            test_name=request.data.get("test_name", ""),
            result_value=request.data.get("result_value", ""),
            unit=request.data.get("unit"),
            reference_range=request.data.get("reference_range"),
            flag=request.data.get("flag", "NORMAL"),
            panel_id=request.data.get("panel_id"),
            specimen_id=request.data.get("specimen_id"),
        )
        order.status = "ANALYZING"
        order.save(update_fields=["status"])
        return Response(LabResultSerializer(result).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="finalize")
    def finalize(self, request, pk=None):
        order = self.get_object()
        order.results.filter(status="PENDING_VALIDATION").update(
            status="FINALIZED",
            finalized_by=request.user.id,
            finalized_at=timezone.now(),
        )
        order.status = "COMPLETED"
        order.save(update_fields=["status"])
        return Response({"detail": "Order finalized."})

    @action(detail=False, methods=["get"], url_path="critical")
    def critical_values(self, request):
        critical_results = LabResult.objects.filter(
            flag="CRITICAL", status="FINALIZED"
        ).select_related("lab_order").order_by("-finalized_at")[:50]
        return Response(LabResultSerializer(critical_results, many=True).data)

    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        qs = self.queryset.exclude(status__in=["COMPLETED", "CANCELLED"])
        return Response(LabOrderSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path="stat")
    def stat_orders(self, request):
        qs = self.queryset.filter(priority="STAT").exclude(status="COMPLETED")
        return Response(LabOrderSerializer(qs, many=True).data)


class LabPanelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = LabPanel.objects.filter(is_active=True).order_by("name")
    serializer_class = LabPanelSerializer


class LabResultViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = LabResult.objects.select_related("lab_order", "panel").order_by("-finalized_at")
    serializer_class = LabResultSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        order_id = self.request.query_params.get("order_id")
        flag = self.request.query_params.get("flag")
        if order_id:
            qs = qs.filter(lab_order_id=order_id)
        if flag:
            qs = qs.filter(flag=flag.upper())
        return qs
