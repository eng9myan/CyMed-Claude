import logging
from django.db import transaction
from .models import GlobalPatient, FacilityMRN, Patient
from cymed_core.events import patient_registered, emit_event

logger = logging.getLogger(__name__)

class PatientWorkflowService:
    @staticmethod
    def register_patient(patient_data: dict, tenant_context: dict) -> Patient:
        """
        Core business logic for registering a new patient.
        Orchestrates EMPI (GlobalPatient) -> FacilityMRN -> Clinical Patient.
        Fires event-driven automations.
        """
        facility_id = tenant_context.get('facility_id')
        user_id = tenant_context.get('user_id')
        
        with transaction.atomic():
            # 1. Create or Map EMPI Record (GlobalPatient)
            demographics = {
                "first_name": patient_data.get("first_name"),
                "last_name": patient_data.get("last_name"),
                "date_of_birth": patient_data.get("date_of_birth"),
                "gender": patient_data.get("gender")
            }
            
            global_patient = GlobalPatient.objects.create(
                master_demographics=demographics,
                global_patient_id=f"GID-{patient_data.get('mrn')}" # Simple hash/id generation for prototype
            )
            
            # 2. Assign Local MRN to the Facility
            if facility_id:
                FacilityMRN.objects.create(
                    patient=global_patient,
                    facility_id=facility_id,
                    local_mrn=patient_data.get('mrn')
                )
                
            # 3. Create Clinical Record
            patient = Patient.objects.create(
                global_patient=global_patient,
                blood_type=patient_data.get("blood_type")
            )
            
            # 3.5 Create Initial Encounter (Walk-In)
            from .models import Encounter
            if facility_id:
                Encounter.objects.create(
                    patient=patient,
                    facility_id=facility_id,
                    encounter_type="OUTPATIENT",
                    status="ARRIVED"
                )
            
            logger.info(f"Registered new patient {patient.id} in Facility {facility_id}")
            
            # 4. Fire the global event to trigger automated workflows (e.g., Billing)
            emit_event(
                patient_registered, 
                sender="PatientWorkflowService", 
                patient_id=patient.id,
                facility_id=facility_id,
                user_id=user_id
            )
            
            return patient

    @staticmethod
    def discharge_patient(encounter_id: str, tenant_context: dict) -> 'Encounter':
        from cymed_core.events import patient_discharged
        from .models import Encounter

        user_id = tenant_context.get('user_id')
        
        with transaction.atomic():
            encounter = Encounter.objects.get(id=encounter_id)
            encounter.status = "DISCHARGED"
            encounter.save(update_fields=['status'])

            # Fire the discharge event
            emit_event(
                patient_discharged,
                sender="PatientWorkflowService",
                patient_id=encounter.patient.id,
                encounter_id=encounter.id,
                discharged_by=user_id
            )

            logger.info(f"Discharged patient from encounter {encounter_id}")
            return encounter

from .models import Encounter, ClinicalNote, Condition
from cymed_core.events import encounter_completed, medication_ordered

class DoctorWorkflowService:
    @staticmethod
    def complete_consultation(encounter_id: str, clinical_data: dict, tenant_context: dict) -> Encounter:
        """
        Finalizes an encounter, saves clinical notes/diagnoses, and emits events for orders.
        """
        user_id = tenant_context.get('user_id')
        facility_id = tenant_context.get('facility_id')
        
        with transaction.atomic():
            encounter = Encounter.objects.get(id=encounter_id)
            
            # 1. Save Clinical Note
            if clinical_data.get('notes'):
                ClinicalNote.objects.create(
                    encounter=encounter,
                    author_id=user_id,
                    note_type="CONSULTATION",
                    content=clinical_data.get('notes')
                )
                
            # 2. Save Diagnoses
            import uuid
            dummy_icd = uuid.uuid4()
            for diagnosis in clinical_data.get('diagnoses', []):
                Condition.objects.create(
                    patient=encounter.patient,
                    encounter=encounter,
                    recorded_by=user_id,
                    terminology_concept_id=dummy_icd,
                    condition_name=diagnosis.get('name'),
                    status="ACTIVE"
                )
                
            # 3. Process Medication Orders
            for med in clinical_data.get('medications', []):
                emit_event(
                    medication_ordered,
                    sender="DoctorWorkflowService",
                    patient_id=encounter.patient.id,
                    encounter_id=encounter.id,
                    facility_id=facility_id,
                    prescriber_id=user_id,
                    medication_name=med.get('name'),
                    dosage=med.get('dosage'),
                    route=med.get('route'),
                    frequency=med.get('frequency'),
                    duration_days=med.get('duration_days', 7)
                )

            # 3.5 Process Diagnostic Orders
            from cymed_core.events import lab_ordered, radiology_ordered
            
            for lab_panel in clinical_data.get('lab_orders', []):
                emit_event(
                    lab_ordered,
                    sender="DoctorWorkflowService",
                    patient_id=encounter.patient.id,
                    encounter_id=encounter.id,
                    ordering_physician_id=user_id,
                    panel_name=lab_panel,
                    priority="ROUTINE"
                )
                
            for rad_modality in clinical_data.get('radiology_orders', []):
                emit_event(
                    radiology_ordered,
                    sender="DoctorWorkflowService",
                    patient_id=encounter.patient.id,
                    encounter_id=encounter.id,
                    ordering_physician_id=user_id,
                    modality=rad_modality,
                    body_part="UNSPECIFIED",
                    reason="Doctor Consultation Request",
                    priority="ROUTINE"
                )
                
            # 4. Mark Encounter Completed
            encounter.status = "COMPLETED"
            encounter.save(update_fields=['status'])
            
            # 5. Emit Encounter Completed Event
            emit_event(
                encounter_completed,
                sender="DoctorWorkflowService",
                encounter_id=encounter.id,
                patient_id=encounter.patient.id,
                facility_id=facility_id
            )
            
            return encounter
