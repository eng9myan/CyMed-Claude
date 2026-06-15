from celery import shared_task
from .models import FhirSyncLog
from datetime import datetime
import json
import uuid

def process_fhir_patient(resource):
    patient_id = resource.get('id')
    name_obj = resource.get('name', [{}])[0]
    given = " ".join(name_obj.get('given', []))
    family = name_obj.get('family', '')
    gender = resource.get('gender', 'unknown')
    birthDate = resource.get('birthDate')
    
    print(f"[FHIR Engine] Synced Patient: {given} {family} (FHIR ID: {patient_id}) - {gender}, {birthDate}")
    # Here it would do GlobalPatient.objects.update_or_create(...)
    return uuid.uuid4()

@shared_task
def sync_fhir_patients(server_url="https://hapi.fhir.org/baseR4", limit=50):
    """
    Background job to sync incoming FHIR Patient resources into CyMed EMPI.
    """
    try:
        patients_processed = 0
        
        # Simulated FHIR Response
        mock_fhir_response = {
            "entry": [
                {
                    "resource": {
                        "resourceType": "Patient",
                        "id": "ex-patient",
                        "name": [{"family": "Smith", "given": ["John", "Jacob"]}],
                        "gender": "male",
                        "birthDate": "1970-01-01"
                    }
                }
            ]
        }
        
        for entry in mock_fhir_response.get('entry', []):
            resource = entry['resource']
            internal_id = process_fhir_patient(resource)
            
            FhirSyncLog.objects.create(
                resource_type="Patient",
                internal_id=internal_id,
                sync_status="SUCCESS"
            )
            patients_processed += 1
            
        return {"status": "success", "processed": patients_processed}
    except Exception as e:
        return {"status": "error", "message": str(e)}
