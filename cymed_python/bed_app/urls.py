from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WardViewSet, BedViewSet, BedAssignmentViewSet, DailyCapacitySnapshotViewSet, SurgeCapacityPlanViewSet

router = DefaultRouter()
router.register(r'wards', WardViewSet)
router.register(r'beds', BedViewSet)
router.register(r'bedassignments', BedAssignmentViewSet)
router.register(r'dailycapacitysnapshots', DailyCapacitySnapshotViewSet)
router.register(r'surgecapacityplans', SurgeCapacityPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
