import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from predictive_app.tasks import process_clinical_event
from predictive_app.models import RiskScore

print("Triggering predictive ingestion pipeline...")
process_clinical_event("patient-999", "VITALS_ENTERED", {"age": 75, "vital": "SpO2 drop to 88%"})

print("Fetching generated risk scores...")
scores = RiskScore.objects.filter(patient_id="patient-999")
for s in scores:
    print(f"[{s.model_name}] Level: {s.risk_level} | Score: {s.score:.2f} | Factors: {s.factors}")
