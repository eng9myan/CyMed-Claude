import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class FraudAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    claim_id = models.UUIDField()
    provider_id = models.UUIDField()
    alert_type = models.CharField(max_length=100) # UPCODING, UNBUNDLING
    risk_score = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=50, default='INVESTIGATING')

    class Meta:
        db_table = 'integrity_fraud_alerts'
