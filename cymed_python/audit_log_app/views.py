from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = "__all__"

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only audit trail — admins only."""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related("user").order_by("-timestamp")

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        if params.get("resource_type"):
            qs = qs.filter(resource_type=params["resource_type"])
        if params.get("resource_id"):
            qs = qs.filter(resource_id=params["resource_id"])
        if params.get("action"):
            qs = qs.filter(action=params["action"].upper())
        if params.get("user_id"):
            qs = qs.filter(user_id=params["user_id"])
        if params.get("date_from"):
            qs = qs.filter(timestamp__date__gte=params["date_from"])
        if params.get("date_to"):
            qs = qs.filter(timestamp__date__lte=params["date_to"])
        return qs

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        from django.db.models import Count
        summary = (
            AuditLog.objects.values("action", "resource_type")
            .annotate(count=Count("id"))
            .order_by("-count")[:20]
        )
        return Response(list(summary))
