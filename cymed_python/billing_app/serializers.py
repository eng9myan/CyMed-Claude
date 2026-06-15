from rest_framework import serializers
from .models import ServiceCharge, Invoice, Payment

class ServiceChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCharge
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

