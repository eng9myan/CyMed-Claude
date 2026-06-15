from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClinicalEncounterViewSet, MedicationSafetyCheckViewSet, SurgicalSafetyCheckViewSet

router = DefaultRouter()
router.register(r'clinical-encounters', ClinicalEncounterViewSet, basename='clinical-encounter')
router.register(r'medication-safety', MedicationSafetyCheckViewSet, basename='medication-safety')
router.register(r'surgical-safety', SurgicalSafetyCheckViewSet, basename='surgical-safety')

urlpatterns = [
    path('', include(router.urls)),
]
