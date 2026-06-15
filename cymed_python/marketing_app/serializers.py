from rest_framework import serializers
from .models import EmailCampaign

class EmailCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailCampaign
        fields = '__all__'

