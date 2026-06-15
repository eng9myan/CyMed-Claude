import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from cds_app.services import CDSEngine

context = {
    "temperature": 38.5,
    "heart_rate": 110,
    "respiratory_rate": 24,
    "blood_glucose": 90,
    "current_medications": ["lisinopril", "warfarin", "aspirin"],
    "new_opioid": False,
    "opioid_naive": False,
    "age": 45
}

print("Evaluating CDS rules for context...")
alerts = CDSEngine.evaluate_context(patient_id="test-patient-123", context_data=context)

for alert in alerts:
    print(f"Triggered [{alert['domain']}] {alert['alert_level']}: {alert['message']}")
