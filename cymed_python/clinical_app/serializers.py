from rest_framework import serializers
from .models import ClinicalEncounter, MedicationSafetyCheck, SurgicalSafetyChecklist

class ClinicalEncounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalEncounter
        fields = '__all__'

class MedicationSafetyCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationSafetyCheck
        fields = '__all__'

class SurgicalSafetyChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgicalSafetyChecklist
        fields = '__all__'
