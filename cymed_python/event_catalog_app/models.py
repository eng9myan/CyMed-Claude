import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class EnterpriseEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    event_name = models.CharField(max_length=150, unique=True, help_text="e.g., PatientRegistered, EncounterOpened")
    domain_owner = models.CharField(max_length=100)
    payload_schema = models.JSONField(help_text="JSON schema definition for the event payload")
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'enterprise_events'

class EventSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    event = models.ForeignKey(EnterpriseEvent, on_delete=models.CASCADE, related_name='subscriptions')
    subscriber_domain = models.CharField(max_length=100)
    handler_endpoint = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'event_subscriptions'
