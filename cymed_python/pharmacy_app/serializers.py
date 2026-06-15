from rest_framework import serializers
from .models import (
    MedicationOrder, PharmacyIntervention, MedicationAdministration,
    SmartDispenseLog, ClinicalVerificationLog, ControlledDrugRegister, RefillRequest,
)


class PharmacyInterventionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyIntervention
        fields = "__all__"


class ClinicalVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalVerificationLog
        fields = "__all__"


class MedicationAdministrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationAdministration
        fields = "__all__"


class SmartDispenseLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartDispenseLog
        fields = "__all__"


class ControlledDrugSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlledDrugRegister
        fields = "__all__"


class RefillRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefillRequest
        fields = "__all__"


class MedicationOrderSerializer(serializers.ModelSerializer):
    interventions = PharmacyInterventionSerializer(many=True, read_only=True)
    verifications = ClinicalVerificationSerializer(many=True, read_only=True)
    is_controlled = serializers.SerializerMethodField()

    class Meta:
        model = MedicationOrder
        fields = "__all__"

    def get_is_controlled(self, obj):
        CONTROLLED = ["morphine", "fentanyl", "oxycodone", "midazolam", "ketamine",
                      "tramadol", "diazepam", "alprazolam", "lorazepam", "codeine"]
        return any(c in obj.medication_name.lower() for c in CONTROLLED)


class MedicationOrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationOrder
        fields = "__all__"
