from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    MedicationOrder, PharmacyIntervention, MedicationAdministration,
    ClinicalVerificationLog, ControlledDrugRegister, RefillRequest,
)
from .serializers import (
    MedicationOrderSerializer, MedicationOrderWriteSerializer,
    PharmacyInterventionSerializer, MedicationAdministrationSerializer,
    ClinicalVerificationSerializer, ControlledDrugSerializer, RefillRequestSerializer,
)

CONTROLLED = ["morphine", "fentanyl", "oxycodone", "midazolam", "ketamine",
              "tramadol", "diazepam", "alprazolam", "lorazepam", "codeine"]


class MedicationOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MedicationOrder.objects.prefetch_related(
        "interventions", "verifications"
    ).order_by("-ordered_at")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return MedicationOrderWriteSerializer
        return MedicationOrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get("patient_id")
        encounter_id = self.request.query_params.get("encounter_id")
        order_status = self.request.query_params.get("status")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if encounter_id:
            qs = qs.filter(encounter_id=encounter_id)
        if order_status:
            qs = qs.filter(status=order_status.upper())
        return qs

    @action(detail=True, methods=["post"], url_path="verify")
    def verify(self, request, pk=None):
        order = self.get_object()
        verification = ClinicalVerificationLog.objects.create(
            medication_order=order,
            pharmacist_id=request.user.id,
            status=request.data.get("status", "VERIFIED"),
            notes=request.data.get("notes", ""),
        )
        return Response(ClinicalVerificationSerializer(verification).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="dispense")
    def dispense(self, request, pk=None):
        order = self.get_object()
        is_controlled = any(c in order.medication_name.lower() for c in CONTROLLED)
        if is_controlled:
            if not request.data.get("verified_by"):
                return Response(
                    {"detail": "Controlled drug requires second pharmacist verification (verified_by)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            ControlledDrugRegister.objects.create(
                medication_order=order,
                dispensed_qty=request.data.get("qty", 1),
                dispensed_by=request.user.id,
                verified_by=request.data.get("verified_by"),
                notes=request.data.get("notes", ""),
            )
        order.status = "ACTIVE"
        order.save(update_fields=["status"])
        return Response({"detail": "Dispensed.", "controlled": is_controlled})

    @action(detail=True, methods=["post"], url_path="hold")
    def hold(self, request, pk=None):
        order = self.get_object()
        reason = request.data.get("reason", "")
        PharmacyIntervention.objects.create(
            medication_order=order,
            pharmacist_id=request.user.id,
            intervention_type="HOLD",
            notes=reason,
            status="PENDING",
        )
        order.status = "ON_HOLD"
        order.save(update_fields=["status"])
        return Response({"detail": "Order placed on hold.", "reason": reason})

    @action(detail=False, methods=["get"], url_path="queue")
    def queue(self, request):
        qs = self.get_queryset().exclude(status__in=["DISCONTINUED", "COMPLETED"])
        return Response(MedicationOrderSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path="controlled")
    def controlled_drugs(self, request):
        from django.db.models import Q
        q = Q()
        for drug in CONTROLLED:
            q |= Q(medication_name__icontains=drug)
        qs = self.get_queryset().filter(q)
        return Response(MedicationOrderSerializer(qs, many=True).data)


class PharmacyInterventionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PharmacyIntervention.objects.select_related("medication_order").order_by("-created_at")
    serializer_class = PharmacyInterventionSerializer


class RefillRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = RefillRequest.objects.order_by("-requested_at")
    serializer_class = RefillRequestSerializer

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        refill = self.get_object()
        refill.status = "APPROVED"
        refill.save(update_fields=["status"])
        return Response({"detail": "Refill approved."})

    @action(detail=True, methods=["post"], url_path="deny")
    def deny(self, request, pk=None):
        refill = self.get_object()
        refill.status = "DENIED"
        refill.save(update_fields=["status"])
        return Response({"detail": "Refill denied."})
