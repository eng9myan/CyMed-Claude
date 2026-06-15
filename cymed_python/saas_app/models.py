import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class TenantSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    tenant_id = models.UUIDField(unique=True)
    tier = models.CharField(max_length=50) # SINGLE, MULTI, ENTERPRISE, NATIONAL
    billing_status = models.CharField(max_length=50) # ACTIVE, SUSPENDED, CANCELLED
    next_billing_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'saas_tenant_subscriptions'

class WhiteLabelConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    tenant_id = models.UUIDField(unique=True)
    custom_domain = models.CharField(max_length=255, null=True, blank=True)
    logo_url = models.CharField(max_length=255, null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#000000')
    language_pack = models.CharField(max_length=10, default='en')

    class Meta:
        db_table = 'saas_whitelabel_configs'
