from rest_framework.routers import DefaultRouter
from .views import ImagingOrderViewSet

router = DefaultRouter()
router.register(r"orders", ImagingOrderViewSet, basename="rad-order")

urlpatterns = router.urls

