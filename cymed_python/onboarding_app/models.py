import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class OnboardingTask(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    tenant_id = models.UUIDField()
    task_name = models.CharField(max_length=100) # ORG_SETUP, FACILITY_SETUP, DATA_IMPORT
    status = models.CharField(max_length=50, default='PENDING') # PENDING, IN_PROGRESS, COMPLETED, FAILED
    error_log = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'onboarding_tasks'
