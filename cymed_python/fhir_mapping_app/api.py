from ninja import Router
from django.shortcuts import get_object_or_404
from patient_app.models import Patient
import uuid

router = Router(tags=["FHIR Export"])

@router.get("/Patient/{patient_id}")
def export_fhir_patient(request, patient_id: uuid.UUID):
    patient = get_object_or_404(Patient, id=patient_id)
    
    # Map Django Model to FHIR R4 Patient Resource
    fhir_resource = {
        "resourceType": "Patient",
        "id": str(patient.id),
        "identifier": [
            {
                "system": "http://cymed.com/mrn",
                "value": patient.global_patient.facility_mrns.first().local_mrn if patient.global_patient and patient.global_patient.facility_mrns.exists() else None
            }
        ],
        "name": [
            {
                "family": patient.global_patient.master_demographics.get('last_name') if patient.global_patient else None,
                "given": [patient.global_patient.master_demographics.get('first_name') if patient.global_patient else None]
            }
        ],
        "gender": patient.global_patient.master_demographics.get('gender', 'unknown').lower() if patient.global_patient else "unknown",
        "birthDate": patient.global_patient.master_demographics.get('date_of_birth') if patient.global_patient else None,
        "active": patient.global_patient.is_active if patient.global_patient else True
    }
    
    return fhir_resource
