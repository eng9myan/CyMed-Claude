from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WardViewSet, BedViewSet, AdmissionViewSet, HospitalAuditLogViewSet, PatientMergeViewSet

router = DefaultRouter()
router.register(r'wards', WardViewSet)
router.register(r'beds', BedViewSet)
router.register(r'admissions', AdmissionViewSet)
router.register(r'hospital-audit-logs', HospitalAuditLogViewSet)
router.register(r'patient-merges', PatientMergeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
