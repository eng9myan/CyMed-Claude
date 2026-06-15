from rest_framework import serializers
from .models import Ward, Bed, Admission, HospitalAuditLog, PatientMerge

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = '__all__'

class BedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = '__all__'

class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = '__all__'

class HospitalAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalAuditLog
        fields = '__all__'

class PatientMergeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMerge
        fields = '__all__'
