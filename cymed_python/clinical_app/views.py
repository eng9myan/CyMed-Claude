from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import ClinicalEncounter, MedicationSafetyCheck, SurgicalSafetyChecklist
from .serializers import ClinicalEncounterSerializer, MedicationSafetyCheckSerializer, SurgicalSafetyChecklistSerializer

class ClinicalEncounterViewSet(viewsets.ModelViewSet):
    queryset = ClinicalEncounter.objects.all()
    serializer_class = ClinicalEncounterSerializer
    permission_classes = [AllowAny]

class MedicationSafetyCheckViewSet(viewsets.ModelViewSet):
    queryset = MedicationSafetyCheck.objects.all()
    serializer_class = MedicationSafetyCheckSerializer
    permission_classes = [AllowAny]

class SurgicalSafetyCheckViewSet(viewsets.ModelViewSet):
    queryset = SurgicalSafetyChecklist.objects.all()
    serializer_class = SurgicalSafetyChecklistSerializer
    permission_classes = [AllowAny]
