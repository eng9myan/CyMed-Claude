from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Appointment, SchedulableResource
from .serializers import AppointmentSerializer, AppointmentWriteSerializer, SchedulableResourceSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Appointment.objects.select_related("primary_resource").order_by("start_time")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AppointmentWriteSerializer
        return AppointmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get("patient_id")
        resource_id = self.request.query_params.get("resource_id")
        appt_status = self.request.query_params.get("status")
        date = self.request.query_params.get("date")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if resource_id:
            qs = qs.filter(primary_resource__resource_id=resource_id)
        if appt_status:
            qs = qs.filter(status=appt_status.upper())
        if date:
            qs = qs.filter(start_time__date=date)
        return qs

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        appt = self.get_object()
        appt.status = "CANCELLED"
        appt.save(update_fields=["status"])
        return Response({"detail": "Appointment cancelled."})

    @action(detail=True, methods=["post"], url_path="arrive")
    def arrive(self, request, pk=None):
        appt = self.get_object()
        appt.status = "ARRIVED"
        appt.save(update_fields=["status"])
        return Response({"detail": "Patient arrived."})

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        appt = self.get_object()
        appt.status = "COMPLETED"
        appt.save(update_fields=["status"])
        return Response({"detail": "Appointment completed."})

    @action(detail=True, methods=["post"], url_path="no-show")
    def no_show(self, request, pk=None):
        appt = self.get_object()
        appt.status = "NO_SHOW"
        appt.save(update_fields=["status"])
        return Response({"detail": "Marked as no-show."})

    @action(detail=False, methods=["get"], url_path="today")
    def today(self, request):
        from django.utils import timezone
        qs = self.get_queryset().filter(start_time__date=timezone.localdate())
        return Response(AppointmentSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path="upcoming")
    def upcoming(self, request):
        from django.utils import timezone
        qs = self.get_queryset().filter(start_time__gte=timezone.now(), status="SCHEDULED")[:50]
        return Response(AppointmentSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path="availability")
    def availability(self, request):
        resource_id = request.query_params.get("resource_id")
        date = request.query_params.get("date")
        if not resource_id or not date:
            return Response({"detail": "resource_id and date required."}, status=status.HTTP_400_BAD_REQUEST)
        booked = Appointment.objects.filter(
            primary_resource__resource_id=resource_id,
            start_time__date=date,
            status__in=["SCHEDULED", "ARRIVED"],
        ).values("start_time", "end_time", "id")
        return Response({"date": date, "resource_id": resource_id, "booked_slots": list(booked)})


class SchedulableResourceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = SchedulableResource.objects.filter(is_active=True)
    serializer_class = SchedulableResourceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        resource_type = self.request.query_params.get("type")
        if resource_type:
            qs = qs.filter(resource_type=resource_type.upper())
        return qs
