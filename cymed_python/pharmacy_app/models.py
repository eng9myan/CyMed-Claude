import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class MedicationOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    patient_id = models.UUIDField(null=True, blank=True)
    prescribing_physician_id = models.UUIDField()
    terminology_concept_id = models.UUIDField(help_text="RxNorm code for medication")
    medication_name = models.CharField(max_length=255)
    dose = models.CharField(max_length=50)
    route = models.CharField(max_length=50) # PO, IV, IM, SUBQ
    frequency = models.CharField(max_length=50) # QD, BID, TID, QID, PRN
    prn_reason = models.CharField(max_length=255, null=True, blank=True)
    duration_days = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50) # ACTIVE, DISCONTINUED, COMPLETED, ON_HOLD
    ordered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pharmacy_orders'

class PharmacyIntervention(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    medication_order = models.ForeignKey(MedicationOrder, on_delete=models.CASCADE, related_name='interventions')
    pharmacist_id = models.UUIDField()
    intervention_type = models.CharField(max_length=100) # e.g. Dose Adjustment, Interaction
    notes = models.TextField()
    status = models.CharField(max_length=50) # PENDING, ACCEPTED, REJECTED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pharmacy_interventions'

class MedicationAdministration(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    medication_order = models.ForeignKey(MedicationOrder, on_delete=models.CASCADE, related_name='administrations')
    administered_by = models.UUIDField(help_text="Nurse ID")
    administered_at = models.DateTimeField(auto_now_add=True)
    dose_given = models.CharField(max_length=50)
    route = models.CharField(max_length=50)
    status = models.CharField(max_length=50) # GIVEN, REFUSED, MISSED, HELD
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'pharmacy_administrations'

class SmartDispenseLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    medication_order = models.ForeignKey(MedicationOrder, on_delete=models.CASCADE)
    cabinet_id = models.CharField(max_length=100)
    nurse_id = models.UUIDField()
    dispensed_qty = models.FloatField()
    dispensed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pharmacy_dispense_logs'

class ClinicalVerificationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    medication_order = models.ForeignKey(MedicationOrder, on_delete=models.CASCADE, related_name='verifications')
    pharmacist_id = models.UUIDField()
    verified_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50) # VERIFIED, REJECTED, PENDING_INFO
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'pharmacy_clinical_verifications'

class ControlledDrugRegister(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    medication_order = models.ForeignKey(MedicationOrder, on_delete=models.CASCADE)
    dispensed_qty = models.FloatField()
    dispensed_by = models.UUIDField(help_text="Primary Pharmacist")
    verified_by = models.UUIDField(help_text="Second Pharmacist/Manager for 2-step verification")
    dispensed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'pharmacy_controlled_drug_register'

class RefillRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    medication_name = models.CharField(max_length=255)
    requested_by = models.UUIDField(help_text="User ID of requestor")
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50) # PENDING, APPROVED, DENIED
    original_order = models.ForeignKey(MedicationOrder, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'pharmacy_refill_requests'
