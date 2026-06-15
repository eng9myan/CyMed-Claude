from rest_framework import serializers
from .models import Ward, Bed, BedAssignment, DailyCapacitySnapshot, SurgeCapacityPlan

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = '__all__'

class BedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = '__all__'

class BedAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BedAssignment
        fields = '__all__'

class DailyCapacitySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCapacitySnapshot
        fields = '__all__'

class SurgeCapacityPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgeCapacityPlan
        fields = '__all__'

