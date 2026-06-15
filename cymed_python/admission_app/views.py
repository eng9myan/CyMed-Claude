from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Admission, Encounter, WorkflowEvent, TriageAssessment, DischargeOrder
from .serializers import (
    AdmissionSerializer, EncounterSerializer, WorkflowEventSerializer,
    TriageAssessmentSerializer, DischargeOrderSerializer,
)
from .workflow import transition, EncounterState, TRANSITIONS


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all().order_by("-admitted_at")
    serializer_class = AdmissionSerializer
    permission_classes = [IsAuthenticated]


class EncounterViewSet(viewsets.ModelViewSet):
    serializer_class = EncounterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Encounter.objects.all().order_by("-created_at")
        facility_id = self.request.query_params.get("facility_id")
        patient_id  = self.request.query_params.get("patient_id")
        status_     = self.request.query_params.get("status")
        if facility_id:
            qs = qs.filter(facility_id=facility_id)
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if status_:
            qs = qs.filter(workflow_status=status_)
        return qs

    @action(detail=True, methods=["post"], url_path="transition")
    def do_transition(self, request, pk=None):
        encounter = self.get_object()
        new_state = request.data.get("state")
        notes     = request.data.get("notes", "")
        if not new_state:
            return Response({"error": "state is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            transition(encounter, new_state, user=request.user, notes=notes)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(EncounterSerializer(encounter).data)

    @action(detail=True, methods=["get"], url_path="timeline")
    def timeline(self, request, pk=None):
        encounter = self.get_object()
        events = WorkflowEvent.objects.filter(encounter=encounter).order_by("created_at")
        return Response(WorkflowEventSerializer(events, many=True).data)

    @action(detail=True, methods=["get", "post"], url_path="triage")
    def triage(self, request, pk=None):
        encounter = self.get_object()
        if request.method == "GET":
            try:
                t = encounter.triage
                return Response(TriageAssessmentSerializer(t).data)
            except TriageAssessment.DoesNotExist:
                return Response({}, status=status.HTTP_204_NO_CONTENT)
        ser = TriageAssessmentSerializer(data={**request.data, "encounter": encounter.pk})
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get", "post"], url_path="discharge")
    def discharge(self, request, pk=None):
        encounter = self.get_object()
        if request.method == "GET":
            try:
                d = encounter.discharge_order
                return Response(DischargeOrderSerializer(d).data)
            except DischargeOrder.DoesNotExist:
                return Response({}, status=status.HTTP_204_NO_CONTENT)
        ser = DischargeOrderSerializer(data={**request.data, "encounter": encounter.pk})
        ser.is_valid(raise_exception=True)
        ser.save()
        # Auto-transition to discharge_planning if not already further
        if encounter.workflow_status not in (
            EncounterState.DISCHARGE_PLANNING, EncounterState.DISCHARGED,
            EncounterState.BILLED, EncounterState.CLOSED,
        ):
            try:
                transition(encounter, EncounterState.DISCHARGE_PLANNING, user=request.user)
            except ValueError:
                pass
        return Response(ser.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="active")
    def active(self, request):
        terminal = {EncounterState.DISCHARGED, EncounterState.BILLED, EncounterState.CLOSED, EncounterState.CANCELLED}
        qs = self.get_queryset().exclude(workflow_status__in=terminal)
        return Response(EncounterSerializer(qs, many=True).data)
