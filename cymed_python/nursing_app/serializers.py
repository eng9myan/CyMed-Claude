from rest_framework import serializers
from .models import VitalSigns, NursingNote, MedicationAdministration, CarePlan, FallRiskAssessment


class VitalSignsSerializer(serializers.ModelSerializer):
    news2_score = serializers.ReadOnlyField()
    bmi = serializers.ReadOnlyField()

    class Meta:
        model = VitalSigns
        fields = "__all__"
        read_only_fields = ["id"]


class NursingNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = NursingNote
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class MedicationAdministrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationAdministration
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class CarePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarePlan
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class FallRiskSerializer(serializers.ModelSerializer):
    morse_score = serializers.ReadOnlyField()
    risk_level = serializers.ReadOnlyField()

    class Meta:
        model = FallRiskAssessment
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
