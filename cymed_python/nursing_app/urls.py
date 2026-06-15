from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VitalSignsViewSet, NursingNoteViewSet,
    MedicationAdministrationViewSet, CarePlanViewSet, FallRiskViewSet,
)

router = DefaultRouter()
router.register(r"vitals",      VitalSignsViewSet,              basename="vitals")
router.register(r"notes",       NursingNoteViewSet,             basename="nursing-notes")
router.register(r"mar",         MedicationAdministrationViewSet, basename="mar")
router.register(r"care-plans",  CarePlanViewSet,                basename="care-plans")
router.register(r"fall-risk",   FallRiskViewSet,                basename="fall-risk")

urlpatterns = [
    path("", include(router.urls)),
]
