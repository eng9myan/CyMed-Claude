import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class EpidemiologyAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    disease_name = models.CharField(max_length=200)
    region = models.CharField(max_length=100)
    incident_count = models.IntegerField(default=0)
    alert_level = models.CharField(max_length=50) # WATCH, WARNING, OUTBREAK

    class Meta:
        db_table = 'pophealth_alerts'
