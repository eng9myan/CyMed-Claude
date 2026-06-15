from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Ward, Bed, Admission, HospitalAuditLog, PatientMerge
from .serializers import WardSerializer, BedSerializer, AdmissionSerializer, HospitalAuditLogSerializer, PatientMergeSerializer

class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer
    permission_classes = [AllowAny]

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all()
    serializer_class = BedSerializer
    permission_classes = [AllowAny]

class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionSerializer
    permission_classes = [AllowAny]

class HospitalAuditLogViewSet(viewsets.ModelViewSet):
    queryset = HospitalAuditLog.objects.all()
    serializer_class = HospitalAuditLogSerializer
    permission_classes = [AllowAny]

class PatientMergeViewSet(viewsets.ModelViewSet):
    queryset = PatientMerge.objects.all()
    serializer_class = PatientMergeSerializer
    permission_classes = [AllowAny]
