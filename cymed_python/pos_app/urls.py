from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import POSRegisterViewSet, POSOrderViewSet

router = DefaultRouter()
router.register(r'posregisters', POSRegisterViewSet)
router.register(r'posorders', POSOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
