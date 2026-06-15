from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HelpdeskTicketViewSet, NotificationViewSet, EmailTemplateViewSet

router = DefaultRouter()
router.register(r'helpdesk-tickets', HelpdeskTicketViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'email-templates', EmailTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
