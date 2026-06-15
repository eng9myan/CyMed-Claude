import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class MetadataCatalog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    dataset_name = models.CharField(max_length=100)
    source_system = models.CharField(max_length=100)
    schema_definition = models.JSONField()
    owner = models.CharField(max_length=100)
    is_pii_compliant = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'data_metadata_catalog'
