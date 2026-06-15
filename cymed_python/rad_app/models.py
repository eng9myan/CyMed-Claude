import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ImagingOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    patient_id = models.UUIDField(null=True, blank=True)
    ordering_physician_id = models.UUIDField()
    modality = models.CharField(max_length=50) # XRAY, MRI, CT, US
    body_part = models.CharField(max_length=100)
    reason_for_exam = models.TextField()
    priority = models.CharField(max_length=50)
    status = models.CharField(max_length=50) # ORDERED, SCHEDULED, IMAGING, INTERPRETATION, COMPLETED, CANCELLED
    ordered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rad_orders'

class ImagingStudy(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    order = models.OneToOneField(ImagingOrder, on_delete=models.CASCADE, related_name='study')
    dicom_study_uid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    performed_by = models.UUIDField(help_text="Technician ID")
    performed_at = models.DateTimeField(auto_now_add=True)
    pacs_url = models.URLField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'rad_studies'

class ImagingReport(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    study = models.OneToOneField(ImagingStudy, on_delete=models.CASCADE, related_name='report')
    radiologist_id = models.UUIDField()
    findings = models.TextField()
    impression = models.TextField()
    ai_pre_read = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50) # PRELIMINARY, FINAL, AMENDED
    finalized_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'rad_reports'
