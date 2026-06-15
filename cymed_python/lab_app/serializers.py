from rest_framework import serializers
from .models import LabOrder, LabPanel, LabSpecimen, LabResult


class LabPanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabPanel
        fields = "__all__"


class LabSpecimenSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabSpecimen
        fields = "__all__"


class LabResultSerializer(serializers.ModelSerializer):
    is_critical = serializers.SerializerMethodField()

    class Meta:
        model = LabResult
        fields = "__all__"

    def get_is_critical(self, obj):
        return obj.flag == "CRITICAL"


class LabOrderSerializer(serializers.ModelSerializer):
    specimens = LabSpecimenSerializer(many=True, read_only=True)
    results = LabResultSerializer(many=True, read_only=True)
    tat_minutes = serializers.SerializerMethodField()
    has_critical = serializers.SerializerMethodField()

    class Meta:
        model = LabOrder
        fields = "__all__"

    def get_tat_minutes(self, obj):
        from django.utils import timezone
        return int((timezone.now() - obj.ordered_at).total_seconds() / 60)

    def get_has_critical(self, obj):
        return obj.results.filter(flag="CRITICAL").exists()


class LabOrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabOrder
        fields = "__all__"
