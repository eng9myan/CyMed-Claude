import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class LabOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    patient_id = models.UUIDField(null=True, blank=True)
    ordering_physician_id = models.UUIDField()
    status = models.CharField(max_length=50) # ORDERED, COLLECTED, ANALYZING, VALIDATION, COMPLETED, CANCELLED
    priority = models.CharField(max_length=50) # ROUTINE, STAT, URGENT
    ordered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lab_orders'

class LabPanel(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    terminology_concept_id = models.UUIDField(help_text="LOINC Code")
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'lab_panels'

class LabSpecimen(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    lab_order = models.ForeignKey(LabOrder, on_delete=models.CASCADE, related_name='specimens')
    specimen_type = models.CharField(max_length=100) # e.g. BLOOD, URINE, CSF
    barcode = models.CharField(max_length=100, unique=True, null=True, blank=True)
    collected_by = models.UUIDField()
    collected_at = models.DateTimeField(auto_now_add=True)
    received_in_lab_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'lab_specimens'

class LabResult(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    lab_order = models.ForeignKey(LabOrder, on_delete=models.CASCADE, related_name='results')
    panel = models.ForeignKey(LabPanel, on_delete=models.SET_NULL, null=True, blank=True)
    specimen = models.ForeignKey(LabSpecimen, on_delete=models.SET_NULL, null=True, blank=True)
    terminology_concept_id = models.UUIDField(help_text="LOINC code for specific test", null=True, blank=True)
    test_name = models.CharField(max_length=255)
    result_value = models.CharField(max_length=255)
    unit = models.CharField(max_length=50, null=True, blank=True)
    reference_range = models.CharField(max_length=100, null=True, blank=True)
    flag = models.CharField(max_length=50, null=True, blank=True) # NORMAL, HIGH, LOW, CRITICAL
    status = models.CharField(max_length=50, default="PENDING_VALIDATION") # PENDING_VALIDATION, FINALIZED, REJECTED
    finalized_by = models.UUIDField(null=True, blank=True)
    finalized_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'lab_results'
