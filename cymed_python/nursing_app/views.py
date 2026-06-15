from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import VitalSigns, NursingNote, MedicationAdministration, CarePlan, FallRiskAssessment
from .serializers import (
    VitalSignsSerializer, NursingNoteSerializer,
    MedicationAdministrationSerializer, CarePlanSerializer, FallRiskSerializer,
)


class VitalSignsViewSet(viewsets.ModelViewSet):
    serializer_class = VitalSignsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = VitalSigns.objects.all().order_by("-recorded_at")
        patient_id   = self.request.query_params.get("patient_id")
        encounter_id = self.request.query_params.get("encounter_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if encounter_id:
            qs = qs.filter(encounter_id=encounter_id)
        return qs

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        encounter_id = request.query_params.get("encounter_id")
        if not encounter_id:
            return Response({"error": "encounter_id required"}, status=status.HTTP_400_BAD_REQUEST)
        vital = VitalSigns.objects.filter(encounter_id=encounter_id).order_by("-recorded_at").first()
        if not vital:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response(VitalSignsSerializer(vital).data)


class NursingNoteViewSet(viewsets.ModelViewSet):
    serializer_class = NursingNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = NursingNote.objects.all().order_by("-created_at")
        encounter_id = self.request.query_params.get("encounter_id")
        if encounter_id:
            qs = qs.filter(encounter_id=encounter_id)
        return qs


class MedicationAdministrationViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationAdministrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = MedicationAdministration.objects.all().order_by("-administered_at")
        encounter_id = self.request.query_params.get("encounter_id")
        patient_id   = self.request.query_params.get("patient_id")
        if encounter_id:
            qs = qs.filter(encounter_id=encounter_id)
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs

    @action(detail=True, methods=["post"], url_path="administer")
    def administer(self, request, pk=None):
        mar = self.get_object()
        mar.status = "given"
        mar.administered_by = request.user.id
        import django.utils.timezone as tz
        mar.administered_at = tz.now()
        mar.save(update_fields=["status", "administered_by", "administered_at"])
        return Response(MedicationAdministrationSerializer(mar).data)


class CarePlanViewSet(viewsets.ModelViewSet):
    serializer_class = CarePlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CarePlan.objects.all().order_by("-created_at")
        encounter_id = self.request.query_params.get("encounter_id")
        if encounter_id:
            qs = qs.filter(encounter_id=encounter_id)
        return qs


class FallRiskViewSet(viewsets.ModelViewSet):
    serializer_class = FallRiskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = FallRiskAssessment.objects.all().order_by("-created_at")
        encounter_id = self.request.query_params.get("encounter_id")
        if encounter_id:
            qs = qs.filter(encounter_id=encounter_id)
        return qs
