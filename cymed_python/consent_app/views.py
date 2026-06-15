"""Consent Management REST API — DRF ViewSets."""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import ConsentGrant, ConsentAccessLog, AuthorizedRepresentative, BreakGlassAccess
from .serializers import (
    ConsentGrantSerializer, ConsentGrantCreateSerializer,
    AuthorizedRepresentativeSerializer, BreakGlassAccessSerializer,
    ConsentAccessLogSerializer,
)
from . import services


class ConsentGrantViewSet(viewsets.ModelViewSet):
    serializer_class  = ConsentGrantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ConsentGrant.objects.all()
        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        ser = ConsentGrantCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        grant = services.grant_consent(
            patient_id    = d["patient_id"],
            granted_by    = request.user.id,
            granted_to_type = d["granted_to_type"],
            granted_to_id   = d["granted_to_id"],
            granted_to_name = d["granted_to_name"],
            scopes        = d["scopes"],
            purpose       = d.get("purpose", "treatment"),
            valid_until   = d.get("valid_until"),
            episode_id    = d.get("episode_id"),
            ip_address    = request.META.get("REMOTE_ADDR", ""),
            patient_signature = d.get("patient_signature", ""),
            notes         = d.get("notes", ""),
        )
        return Response(ConsentGrantSerializer(grant).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        reason = request.data.get("reason", "")
        if not reason:
            return Response({"error": "reason is required"}, status=400)
        grant = services.revoke_consent(
            consent_id=pk, revoked_by=request.user.id, reason=reason
        )
        return Response(ConsentGrantSerializer(grant).data)

    @action(detail=False, methods=["get"])
    def check(self, request):
        """Quick consent check — returns {allowed, reason}."""
        allowed, reason = services.check_access(
            patient_id    = request.query_params.get("patient_id"),
            requester_id  = request.user.id,
            requester_type= request.query_params.get("requester_type", "provider"),
            scope         = request.query_params.get("scope", "full_record"),
            facility_id   = request.query_params.get("facility_id"),
            ip_address    = request.META.get("REMOTE_ADDR", ""),
        )
        return Response({"allowed": allowed, "reason": reason})


class BreakGlassViewSet(viewsets.ModelViewSet):
    serializer_class   = BreakGlassAccessSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return BreakGlassAccess.objects.order_by("-access_start")

    def create(self, request, *args, **kwargs):
        ser = BreakGlassAccessSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        try:
            bg = services.open_break_glass(
                patient_id    = d["patient_id"],
                user          = request.user,
                facility_id   = d["facility_id"],
                justification = d["justification"],
                notes         = d["notes"],
                scopes        = d["scopes_accessed"],
                ip_address    = request.META.get("REMOTE_ADDR", ""),
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        return Response(BreakGlassAccessSerializer(bg).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        bg = services.close_break_glass(break_glass_id=pk)
        return Response(BreakGlassAccessSerializer(bg).data)


class AuthorizedRepresentativeViewSet(viewsets.ModelViewSet):
    serializer_class   = AuthorizedRepresentativeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AuthorizedRepresentative.objects.all()
        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.filter(active=True).order_by("name")


class ConsentAccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = ConsentAccessLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ConsentAccessLog.objects.all()
        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-timestamp")[:200]
