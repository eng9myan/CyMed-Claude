from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from .models import Ward, Bed, BedAssignment, DailyCapacitySnapshot, SurgeCapacityPlan
from .serializers import WardSerializer, BedSerializer, BedAssignmentSerializer, DailyCapacitySnapshotSerializer, SurgeCapacityPlanSerializer

class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all()
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class BedAssignmentViewSet(viewsets.ModelViewSet):
    queryset = BedAssignment.objects.all()
    serializer_class = BedAssignmentSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class DailyCapacitySnapshotViewSet(viewsets.ModelViewSet):
    queryset = DailyCapacitySnapshot.objects.all()
    serializer_class = DailyCapacitySnapshotSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class SurgeCapacityPlanViewSet(viewsets.ModelViewSet):
    queryset = SurgeCapacityPlan.objects.all()
    serializer_class = SurgeCapacityPlanSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

