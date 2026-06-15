from django.db import transaction
from django.utils import timezone
from .models import VitalSign, NursingAssessment
import uuid

@transaction.atomic
def record_vitals(encounter_id, nurse_id, temperature, heart_rate, blood_pressure, respiratory_rate, spo2):
    vitals = VitalSign.objects.create(
        encounter_id=encounter_id,
        recorded_by=nurse_id,
        temperature=temperature,
        heart_rate=heart_rate,
        blood_pressure=blood_pressure,
        respiratory_rate=respiratory_rate,
        spo2=spo2,
        recorded_at=timezone.now()
    )
    return vitals

@transaction.atomic
def record_assessment(encounter_id, nurse_id, assessment_type, notes):
    assessment = NursingAssessment.objects.create(
        encounter_id=encounter_id,
        assessed_by=nurse_id,
        assessment_type=assessment_type,
        notes=notes,
        assessed_at=timezone.now()
    )
    return assessment

class NursingWorkflowService:
    @staticmethod
    @transaction.atomic
    def triage_patient(encounter_id, vitals_data, user_id):
        from patient_app.models import Encounter
        encounter = Encounter.objects.get(id=encounter_id)
        vitals = VitalSign.objects.create(
            encounter_id=encounter_id,
            patient_id=encounter.patient_id,
            recorded_by=user_id,
            **vitals_data
        )
        
        if encounter.status == 'ARRIVED':
            encounter.status = 'TRIAGED'
            encounter.save(update_fields=['status'])
        return vitals
