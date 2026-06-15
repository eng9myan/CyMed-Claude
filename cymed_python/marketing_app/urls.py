from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmailCampaignViewSet

router = DefaultRouter()
router.register(r'emailcampaigns', EmailCampaignViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
