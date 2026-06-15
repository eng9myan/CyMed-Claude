from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from .models import GlobalPatient, FacilityMRN, ExternalIdentifier, PatientMergeLog, Patient, Encounter, ClinicalNote, Condition, Allergy
from .serializers import GlobalPatientSerializer, FacilityMRNSerializer, ExternalIdentifierSerializer, PatientMergeLogSerializer, PatientSerializer, EncounterSerializer, ClinicalNoteSerializer, ConditionSerializer, AllergySerializer

class GlobalPatientViewSet(viewsets.ModelViewSet):
    queryset = GlobalPatient.objects.all()
    serializer_class = GlobalPatientSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class FacilityMRNViewSet(viewsets.ModelViewSet):
    queryset = FacilityMRN.objects.all()
    serializer_class = FacilityMRNSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class ExternalIdentifierViewSet(viewsets.ModelViewSet):
    queryset = ExternalIdentifier.objects.all()
    serializer_class = ExternalIdentifierSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class PatientMergeLogViewSet(viewsets.ModelViewSet):
    queryset = PatientMergeLog.objects.all()
    serializer_class = PatientMergeLogSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class EncounterViewSet(viewsets.ModelViewSet):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class ClinicalNoteViewSet(viewsets.ModelViewSet):
    queryset = ClinicalNote.objects.all()
    serializer_class = ClinicalNoteSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class AllergyViewSet(viewsets.ModelViewSet):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

