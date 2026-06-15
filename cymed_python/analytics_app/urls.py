from rest_framework.routers import DefaultRouter
from .views import KpiSnapshotViewSet, DashboardConfigViewSet

router = DefaultRouter()
router.register(r"kpi", KpiSnapshotViewSet, basename="kpi-snapshot")
router.register(r"dashboard-config", DashboardConfigViewSet, basename="dashboard-config")

urlpatterns = router.urls

