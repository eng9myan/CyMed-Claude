from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConnectedDeviceViewSet, DeviceReadingViewSet, RPMAlertViewSet

router = DefaultRouter()
router.register(r'connecteddevices', ConnectedDeviceViewSet)
router.register(r'devicereadings', DeviceReadingViewSet)
router.register(r'rpmalerts', RPMAlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
