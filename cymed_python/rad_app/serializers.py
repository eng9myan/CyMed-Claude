from rest_framework import serializers
from .models import ImagingOrder, ImagingStudy, ImagingReport


class ImagingStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagingStudy
        fields = "__all__"


class ImagingReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagingReport
        fields = "__all__"


class ImagingOrderSerializer(serializers.ModelSerializer):
    study = ImagingStudySerializer(read_only=True)

    class Meta:
        model = ImagingOrder
        fields = "__all__"


class ImagingOrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagingOrder
        fields = "__all__"
