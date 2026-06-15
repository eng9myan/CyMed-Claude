import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class DentalChart(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dental_app_dentalcharts'
