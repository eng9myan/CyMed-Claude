from rest_framework import serializers
from .models import POSRegister, POSOrder

class POSRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSRegister
        fields = '__all__'

class POSOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSOrder
        fields = '__all__'

