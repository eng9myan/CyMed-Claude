from rest_framework import serializers
from .models import HelpdeskTicket, Notification, EmailTemplate

class HelpdeskTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpdeskTicket
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'
