import uuid6
from django.db import models
from django.conf import settings

def generate_uuidv7():
    return uuid6.uuid7()

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50) # CREATE, READ, UPDATE, DELETE, EXPORT
    resource_type = models.CharField(max_length=100) # e.g., Patient, ClinicalNote
    resource_id = models.CharField(max_length=255, null=True, blank=True)
    before_value = models.JSONField(null=True, blank=True)
    after_value = models.JSONField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True, help_text="Why")
    device = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    endpoint = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['user', 'action']),
        ]

    def __str__(self):
        return f"{self.user} - {self.action} - {self.resource_type} ({self.timestamp})"
