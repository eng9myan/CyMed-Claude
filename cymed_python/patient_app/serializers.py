from rest_framework import serializers
from .models import GlobalPatient, FacilityMRN, ExternalIdentifier, PatientMergeLog, Patient, Encounter, ClinicalNote, Condition, Allergy

class GlobalPatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalPatient
        fields = '__all__'

class FacilityMRNSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityMRN
        fields = '__all__'

class ExternalIdentifierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalIdentifier
        fields = '__all__'

class PatientMergeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMergeLog
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class EncounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Encounter
        fields = '__all__'

class ClinicalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalNote
        fields = '__all__'

class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = '__all__'

class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = '__all__'

