from rest_framework import serializers
from .models import Admission, Encounter, WorkflowEvent, TriageAssessment, DischargeOrder


class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = "__all__"


class EncounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Encounter
        fields = "__all__"
        read_only_fields = ["id", "encounter_number", "workflow_status", "created_at", "updated_at"]


class WorkflowEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowEvent
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class TriageAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriageAssessment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class DischargeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeOrder
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
