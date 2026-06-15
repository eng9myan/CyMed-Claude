import logging
import uuid
from django.db import transaction
from .models import LabOrder, LabPanel, LabResult

logger = logging.getLogger(__name__)

class LabWorkflowService:
    @staticmethod
    def handle_lab_ordered(sender, **kwargs):
        """
        Listens to lab_ordered event and creates a LabOrder.
        """
        logger.info(f"Laboratory received order for patient {kwargs.get('patient_id')}")
        
        LabOrder.objects.create(
            encounter_id=kwargs.get('encounter_id'),
            patient_id=kwargs.get('patient_id'),
            ordering_physician_id=kwargs.get('ordering_physician_id'),
            status="ORDERED",
            priority=kwargs.get('priority', 'ROUTINE')
        )
        
        # In a real system, we'd link to specific LabPanels requested.
        # For prototype, we just create the order queue item.
        logger.info(f"Successfully generated LabOrder for {kwargs.get('panel_name')}")

    @staticmethod
    def collect_sample(order_id: str, specimen_type: str, barcode: str, phlebotomist_id: str):
        from .models import LabSpecimen
        with transaction.atomic():
            order = LabOrder.objects.get(id=order_id)
            if order.status == "ORDERED":
                order.status = "COLLECTED"
                order.save(update_fields=['status'])
            
            specimen = LabSpecimen.objects.create(
                lab_order=order,
                specimen_type=specimen_type,
                barcode=barcode,
                collected_by=phlebotomist_id
            )
            return specimen

    @staticmethod
    def record_analyzer_results(sample_id: str, results_data: list, technician_id: str):
        from .models import LabSpecimen, LabPanel
        with transaction.atomic():
            specimen = LabSpecimen.objects.get(id=sample_id)
            order = specimen.lab_order
            order.status = "VALIDATION"
            order.save(update_fields=['status'])
            
            panel, _ = LabPanel.objects.get_or_create(
                name="General Panel",
                defaults={'terminology_concept_id': uuid.uuid4()}
            )
            
            created_results = []
            for res in results_data:
                r = LabResult.objects.create(
                    lab_order=order,
                    panel=panel,
                    specimen=specimen,
                    terminology_concept_id=uuid.uuid4(),
                    test_name=res.get('test_name'),
                    result_value=res.get('value'),
                    unit=res.get('unit'),
                    reference_range=res.get('reference_range'),
                    flag=res.get('flag', 'NORMAL'),
                    status="PENDING_VALIDATION"
                )
                created_results.append(r)
            return created_results

    @staticmethod
    def clinical_validation(order_id: str, pathologist_id: str):
        """
        Approves results and completes order.
        """
        from cymed_core.events import lab_result_published, emit_event
        from django.utils import timezone
        
        with transaction.atomic():
            order = LabOrder.objects.get(id=order_id)
            order.status = "COMPLETED"
            order.save(update_fields=['status'])
            
            results = LabResult.objects.filter(lab_order=order, status="PENDING_VALIDATION")
            for res in results:
                res.status = "FINALIZED"
                res.finalized_by = pathologist_id
                res.finalized_at = timezone.now()
                res.save(update_fields=['status', 'finalized_by', 'finalized_at'])
                
            emit_event(
                lab_result_published,
                sender="LabWorkflowService",
                order_id=order.id,
                patient_id=order.patient_id,
                encounter_id=order.encounter_id
            )
            
            logger.info(f"Published lab results for order {order_id}")
            return order

    @staticmethod
    def submit_results(order_id: str, results_data: list, technician_id: str) -> LabOrder:
        """
        Legacy mock for direct submission without collection. 
        """
        from cymed_core.events import lab_result_published, emit_event
        from django.utils import timezone
        
        with transaction.atomic():
            order = LabOrder.objects.get(id=order_id)
            order.status = "COMPLETED"
            order.save(update_fields=['status'])
            
            panel, _ = LabPanel.objects.get_or_create(
                name="General Panel",
                defaults={'terminology_concept_id': uuid.uuid4()}
            )
            
            for res in results_data:
                LabResult.objects.create(
                    lab_order=order,
                    panel=panel,
                    terminology_concept_id=uuid.uuid4(),
                    test_name=res.get('test_name'),
                    result_value=res.get('value'),
                    unit=res.get('unit'),
                    reference_range=res.get('reference_range'),
                    flag=res.get('flag', 'NORMAL'),
                    status="FINALIZED",
                    finalized_by=technician_id,
                    finalized_at=timezone.now()
                )
                
            emit_event(
                lab_result_published,
                sender="LabWorkflowService",
                order_id=order.id,
                patient_id=order.patient_id,
                encounter_id=order.encounter_id
            )
            return order
