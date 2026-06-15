import logging
import uuid
from .models import MedicationOrder

logger = logging.getLogger(__name__)

class PharmacyWorkflowService:
    @staticmethod
    def handle_medication_ordered(sender, **kwargs):
        """
        Listens to the medication_ordered event and creates a MedicationOrder in the Pharmacy Queue.
        """
        logger.info(f"Pharmacy received medication order for patient {kwargs.get('patient_id')}")
        
        # Simulate RxNorm mapping for MVP
        dummy_rxnorm = uuid.uuid4()
        
        MedicationOrder.objects.create(
            encounter_id=kwargs.get('encounter_id'),
            patient_id=kwargs.get('patient_id'),
            prescribing_physician_id=kwargs.get('prescriber_id'),
            terminology_concept_id=dummy_rxnorm,
            medication_name=kwargs.get('medication_name'),
            dose=kwargs.get('dosage'),
            route=kwargs.get('route'),
            frequency=kwargs.get('frequency'),
            duration_days=kwargs.get('duration_days', 7),
            status="ACTIVE"
        )
        
        logger.info(f"Successfully generated MedicationOrder for {kwargs.get('medication_name')}")

    @staticmethod
    def verify_prescription(order_id: str, pharmacist_id: str, notes: str, status: str = "VERIFIED"):
        from .models import ClinicalVerificationLog
        from django.db import transaction
        
        with transaction.atomic():
            order = MedicationOrder.objects.get(id=order_id)
            if status == "REJECTED":
                order.status = "ON_HOLD"
                order.save(update_fields=['status'])
                
            log = ClinicalVerificationLog.objects.create(
                medication_order=order,
                pharmacist_id=pharmacist_id,
                status=status,
                notes=notes
            )
            return log

    @staticmethod
    def request_refill(patient_id: str, medication_name: str, requested_by: str, original_order_id: str = None):
        from .models import RefillRequest
        return RefillRequest.objects.create(
            patient_id=patient_id,
            medication_name=medication_name,
            requested_by=requested_by,
            original_order_id=original_order_id,
            status="PENDING"
        )

    @staticmethod
    def dispense_medication(order_id: str, quantity: float, pharmacist_id: str, is_controlled: bool = False, verified_by_id: str = None) -> MedicationOrder:
        """
        Marks a MedicationOrder as DISPENSED and emits the medication_dispensed event
        to trigger inventory deduction. Require verification for controlled drugs.
        """
        from cymed_core.events import medication_dispensed, emit_event
        from django.db import transaction
        
        if is_controlled and not verified_by_id:
            raise ValueError("Controlled drugs require a secondary verification pharmacist ID.")
            
        with transaction.atomic():
            order = MedicationOrder.objects.get(id=order_id)
            order.status = "DISPENSED"
            order.save(update_fields=['status'])
            
            # Record SmartDispenseLog for audit/traceability
            from .models import SmartDispenseLog, ControlledDrugRegister
            SmartDispenseLog.objects.create(
                medication_order=order,
                cabinet_id="MAIN_PHARMACY_1",
                nurse_id=pharmacist_id, # Pharmacist doing the dispense
                dispensed_qty=quantity
            )
            
            if is_controlled:
                ControlledDrugRegister.objects.create(
                    medication_order=order,
                    dispensed_qty=quantity,
                    dispensed_by=pharmacist_id,
                    verified_by=verified_by_id
                )
            
            # Emit event to deduct inventory
            emit_event(
                medication_dispensed,
                sender="PharmacyWorkflowService",
                medication_sku=order.medication_name, # Map name to SKU for prototype
                quantity=quantity
            )
            
            logger.info(f"Dispensed order {order_id} and emitted inventory event.")
            return order
