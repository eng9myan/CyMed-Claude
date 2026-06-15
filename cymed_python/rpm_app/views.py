from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from .models import ConnectedDevice, DeviceReading, RPMAlert
from .serializers import ConnectedDeviceSerializer, DeviceReadingSerializer, RPMAlertSerializer

class ConnectedDeviceViewSet(viewsets.ModelViewSet):
    queryset = ConnectedDevice.objects.all()
    serializer_class = ConnectedDeviceSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class DeviceReadingViewSet(viewsets.ModelViewSet):
    queryset = DeviceReading.objects.all()
    serializer_class = DeviceReadingSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class RPMAlertViewSet(viewsets.ModelViewSet):
    queryset = RPMAlert.objects.all()
    serializer_class = RPMAlertSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

