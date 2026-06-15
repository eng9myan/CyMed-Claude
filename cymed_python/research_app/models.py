import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ResearchCohort(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=200)
    criteria = models.JSONField()
    patient_count = models.IntegerField(default=0)
    principal_investigator = models.UUIDField()

    class Meta:
        db_table = 'research_cohorts'
