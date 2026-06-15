from rest_framework import serializers, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import KpiSnapshot, ExecutiveDashboardConfig


class KpiSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = KpiSnapshot
        fields = "__all__"


class DashboardConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutiveDashboardConfig
        fields = "__all__"


class KpiSnapshotViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = KpiSnapshotSerializer
    queryset = KpiSnapshot.objects.order_by("-snapshot_date")

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("kpi_name"):
            qs = qs.filter(kpi_name=self.request.query_params["kpi_name"])
        if self.request.query_params.get("facility_id"):
            qs = qs.filter(facility_id=self.request.query_params["facility_id"])
        return qs

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        from django.db.models import Max
        latest_dates = KpiSnapshot.objects.values("kpi_name", "facility_id").annotate(
            latest=Max("snapshot_date")
        )
        results = []
        for row in latest_dates:
            snap = KpiSnapshot.objects.filter(
                kpi_name=row["kpi_name"],
                facility_id=row["facility_id"],
                snapshot_date=row["latest"],
            ).first()
            if snap:
                results.append(KpiSnapshotSerializer(snap).data)
        return Response(results)


class DashboardConfigViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardConfigSerializer
    queryset = ExecutiveDashboardConfig.objects.all()

    def get_queryset(self):
        return super().get_queryset().filter(user_id=self.request.user.id)
