from rest_framework.routers import DefaultRouter
from .views import MedicationOrderViewSet, PharmacyInterventionViewSet, RefillRequestViewSet

router = DefaultRouter()
router.register(r"orders", MedicationOrderViewSet, basename="pharmacy-order")
router.register(r"interventions", PharmacyInterventionViewSet, basename="pharmacy-intervention")
router.register(r"refills", RefillRequestViewSet, basename="pharmacy-refill")

urlpatterns = router.urls

