from rest_framework import serializers
from .models import SchedulableResource, Appointment


class SchedulableResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchedulableResource
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = "__all__"

    def get_duration_minutes(self, obj):
        return int((obj.end_time - obj.start_time).total_seconds() / 60)


class AppointmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

    def validate(self, data):
        if data.get("end_time") and data.get("start_time"):
            if data["end_time"] <= data["start_time"]:
                raise serializers.ValidationError("end_time must be after start_time")
        return data
