from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import HelpdeskTicket, Notification, EmailTemplate
from .serializers import HelpdeskTicketSerializer, NotificationSerializer, EmailTemplateSerializer

class HelpdeskTicketViewSet(viewsets.ModelViewSet):
    queryset = HelpdeskTicket.objects.all()
    serializer_class = HelpdeskTicketSerializer
    permission_classes = [AllowAny]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [AllowAny]
