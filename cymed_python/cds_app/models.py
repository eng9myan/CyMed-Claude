import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ClinicalRule(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=100, default='GENERAL') # ONCOLOGY, SEPSIS, DDI
    condition_expression = models.TextField() # e.g. "patient.age > 65 and vitals.hr > 100"
    action_type = models.CharField(max_length=50) # ALERT, ORDER_SUGGESTION
    action_message = models.TextField(default='')
    alert_level = models.CharField(max_length=50, default='INFO') # HIGH, MEDIUM, LOW
    action_payload = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'cds_rules'
