from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, SchedulableResourceViewSet

router = DefaultRouter()
router.register(r"appointments", AppointmentViewSet, basename="appointment")
router.register(r"resources", SchedulableResourceViewSet, basename="schedulable-resource")

urlpatterns = router.urls

