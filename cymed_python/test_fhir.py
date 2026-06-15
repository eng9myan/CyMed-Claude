import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from fhir_mapping_app.tasks import sync_fhir_patients

print("Simulating FHIR Sync Task...")
result = sync_fhir_patients()
print("Result:", result)
