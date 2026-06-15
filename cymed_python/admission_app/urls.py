from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdmissionViewSet, EncounterViewSet

router = DefaultRouter()
router.register(r"admissions", AdmissionViewSet)
router.register(r"encounters", EncounterViewSet, basename="encounter")

urlpatterns = [
    path("", include(router.urls)),
]
