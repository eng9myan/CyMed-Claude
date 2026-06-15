import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class NationalProviderRegistry(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    npi_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    is_active_license = models.BooleanField(default=True)

    class Meta:
        db_table = 'national_provider_registry'
