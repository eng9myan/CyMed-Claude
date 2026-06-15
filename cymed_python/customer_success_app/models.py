import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class CustomerHealthScore(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    tenant_id = models.UUIDField(unique=True)
    adoption_metric = models.DecimalField(max_digits=5, decimal_places=2, default=0.0) # 0-100
    training_completion = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    health_status = models.CharField(max_length=50, default='AT_RISK') # HEALTHY, WARNING, AT_RISK

    class Meta:
        db_table = 'cs_health_scores'
