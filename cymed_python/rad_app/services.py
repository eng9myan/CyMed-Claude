import logging
from .models import ImagingOrder

logger = logging.getLogger(__name__)

class RadiologyWorkflowService:
    @staticmethod
    def handle_radiology_ordered(sender, **kwargs):
        """
        Listens to radiology_ordered event and creates an ImagingOrder.
        """
        logger.info(f"Radiology received order for patient {kwargs.get('patient_id')}")
        
        ImagingOrder.objects.create(
            encounter_id=kwargs.get('encounter_id'),
            patient_id=kwargs.get('patient_id'),
            ordering_physician_id=kwargs.get('ordering_physician_id'),
            modality=kwargs.get('modality'),
            body_part=kwargs.get('body_part', 'UNSPECIFIED'),
            reason_for_exam=kwargs.get('reason', 'Consultation Request'),
            status="ORDERED",
            priority=kwargs.get('priority', 'ROUTINE')
        )
        
        logger.info(f"Successfully generated ImagingOrder for {kwargs.get('modality')}")

    @staticmethod
    def schedule_imaging(order_id: str, scheduled_time: str):
        from django.db import transaction
        with transaction.atomic():
            order = ImagingOrder.objects.get(id=order_id)
            if order.status == "ORDERED":
                order.status = "SCHEDULED"
                # in a real system we would store the time in a Scheduling model
                order.save(update_fields=['status'])
            return order

    @staticmethod
    def complete_imaging(order_id: str, technician_id: str, dicom_uid: str):
        from django.db import transaction
        from .models import ImagingStudy
        with transaction.atomic():
            order = ImagingOrder.objects.get(id=order_id)
            order.status = "INTERPRETATION"
            order.save(update_fields=['status'])
            
            study = ImagingStudy.objects.create(
                order=order,
                dicom_study_uid=dicom_uid,
                performed_by=technician_id,
                pacs_url=f"https://pacs.cymed.local/viewer?studyUID={dicom_uid}"
            )
            return study

    @staticmethod
    def submit_interpretation(order_id: str, radiologist_id: str, findings: str, impression: str):
        from django.db import transaction
        from .models import ImagingStudy, ImagingReport
        from cymed_core.events import rad_result_published, emit_event
        from django.utils import timezone
        
        with transaction.atomic():
            order = ImagingOrder.objects.get(id=order_id)
            order.status = "COMPLETED"
            order.save(update_fields=['status'])
            
            study = ImagingStudy.objects.get(order=order)
            
            report = ImagingReport.objects.create(
                study=study,
                radiologist_id=radiologist_id,
                findings=findings,
                impression=impression,
                status="FINAL",
                finalized_at=timezone.now()
            )
            
            emit_event(
                rad_result_published,
                sender="RadiologyWorkflowService",
                order_id=order.id,
                patient_id=order.patient_id,
                encounter_id=order.encounter_id
            )
            
            return report
