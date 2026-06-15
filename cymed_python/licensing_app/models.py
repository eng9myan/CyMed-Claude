import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ProductEdition(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=100) # CyMed Clinic, CyMed Hospital, CyMed Enterprise
    max_users = models.IntegerField(null=True, blank=True)
    included_modules = models.JSONField(default=list)
    optional_modules = models.JSONField(default=list)
    ai_features_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'licensing_product_editions'

class LicenseKey(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    key_string = models.CharField(max_length=255, unique=True)
    edition = models.ForeignKey(ProductEdition, on_delete=models.CASCADE)
    tenant_id = models.UUIDField()
    license_type = models.CharField(max_length=50) # SUBSCRIPTION, PERPETUAL, ENTERPRISE
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'licensing_keys'

class FeatureToggle(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    tenant_id = models.UUIDField()
    feature_name = models.CharField(max_length=100)
    is_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'licensing_feature_toggles'
        unique_together = ('tenant_id', 'feature_name')
