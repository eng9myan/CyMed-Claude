from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from .models import POSRegister, POSOrder
from .serializers import POSRegisterSerializer, POSOrderSerializer

class POSRegisterViewSet(viewsets.ModelViewSet):
    queryset = POSRegister.objects.all()
    serializer_class = POSRegisterSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class POSOrderViewSet(viewsets.ModelViewSet):
    queryset = POSOrder.objects.all()
    serializer_class = POSOrderSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

