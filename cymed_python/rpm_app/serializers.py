from rest_framework import serializers
from .models import ConnectedDevice, DeviceReading, RPMAlert

class ConnectedDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectedDevice
        fields = '__all__'

class DeviceReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceReading
        fields = '__all__'

class RPMAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = RPMAlert
        fields = '__all__'

