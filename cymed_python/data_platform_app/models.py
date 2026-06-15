import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class DataWarehouseStream(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    source_table = models.CharField(max_length=100)
    target_warehouse = models.CharField(max_length=100) # Clinical, Financial, Research
    sync_frequency = models.CharField(max_length=50) # Realtime, Hourly, Daily
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'dw_streams'

class DataGovernanceRule(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    target_table = models.CharField(max_length=100)
    target_column = models.CharField(max_length=100)
    masking_rule = models.CharField(max_length=100) # NULLIFY, HASH, SCRAMBLE
    applicable_roles = models.JSONField(help_text="Roles that this masking applies to")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'data_governance_rules'
