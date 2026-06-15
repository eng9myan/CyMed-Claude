from patient_app.models import Patient
import json

class FHIRGenerator:
    @staticmethod
    def generate_patient_resource(patient_id):
        try:
            patient = Patient.objects.get(id=patient_id)
            fhir_resource = {
                "resourceType": "Patient",
                "id": str(patient.id),
                "identifier": [
                    {
                        "use": "usual",
                        "system": "urn:oid:1.2.36.146.595.217.0.1",
                        "value": patient.mrn if hasattr(patient, 'mrn') else str(patient.id)
                    }
                ],
                "active": True,
                "name": [
                    {
                        "use": "official",
                        "family": patient.last_name,
                        "given": [patient.first_name]
                    }
                ],
                "gender": patient.gender.lower() if hasattr(patient, 'gender') and patient.gender else "unknown",
                "birthDate": patient.date_of_birth.isoformat() if hasattr(patient, 'date_of_birth') and patient.date_of_birth else None,
            }
            return fhir_resource
        except Patient.DoesNotExist:
            return None
