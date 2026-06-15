from rest_framework import serializers
from .models import ConsentGrant, ConsentAccessLog, AuthorizedRepresentative, BreakGlassAccess


class ConsentGrantSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ConsentGrant
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class ConsentGrantCreateSerializer(serializers.Serializer):
    patient_id       = serializers.UUIDField()
    granted_to_type  = serializers.CharField(max_length=40)
    granted_to_id    = serializers.UUIDField()
    granted_to_name  = serializers.CharField(max_length=255)
    scopes           = serializers.ListField(child=serializers.CharField())
    purpose          = serializers.CharField(default="treatment")
    valid_until      = serializers.DateTimeField(required=False, allow_null=True)
    episode_id       = serializers.UUIDField(required=False, allow_null=True)
    patient_signature= serializers.CharField(required=False, allow_blank=True)
    notes            = serializers.CharField(required=False, allow_blank=True)


class AuthorizedRepresentativeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AuthorizedRepresentative
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class BreakGlassAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BreakGlassAccess
        fields = "__all__"
        read_only_fields = ["id", "access_start", "patient_notified", "notification_sent_at",
                            "reviewed", "reviewed_by", "reviewed_at", "review_outcome"]


class ConsentAccessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ConsentAccessLog
        fields = "__all__"
