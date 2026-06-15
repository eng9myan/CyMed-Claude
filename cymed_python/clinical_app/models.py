from django.db import models

class ClinicalEncounter(models.Model):
    patient_id = models.IntegerField(null=True, blank=True)
    appointment_id = models.IntegerField(null=True, blank=True)
    doctor_id = models.IntegerField(null=True, blank=True)
    encounter_at = models.DateTimeField(null=True, blank=True)
    chief_complaint = models.TextField(null=True, blank=True)
    clinical_notes = models.TextField(null=True, blank=True)
    diagnosis = models.TextField(null=True, blank=True)
    treatment_plan = models.TextField(null=True, blank=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=100, null=True, blank=True)
    created_by = models.IntegerField(null=True, blank=True)
    
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_clinical_encounters'

class MedicationSafetyCheck(models.Model):
    patient_id = models.IntegerField(null=True, blank=True)
    prescription_id = models.IntegerField(null=True, blank=True)
    allergy_checked = models.BooleanField(default=False)
    dose_checked = models.BooleanField(default=False)
    interaction_checked = models.BooleanField(default=False)
    pregnancy_checked = models.BooleanField(default=False)
    renal_adjustment_checked = models.BooleanField(default=False)
    risk_level = models.CharField(max_length=50, null=True, blank=True)
    warnings = models.TextField(null=True, blank=True)
    checked_by = models.IntegerField(null=True, blank=True)
    checked_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_medication_safety_checks'

class SurgicalSafetyChecklist(models.Model):
    patient_id = models.IntegerField(null=True, blank=True)
    surgery_id = models.IntegerField(null=True, blank=True)
    
    sign_in_identity_confirmed = models.BooleanField(default=False)
    sign_in_site_marked = models.BooleanField(default=False)
    sign_in_anaesthesia_safety_check = models.BooleanField(default=False)
    sign_in_pulse_oximeter_working = models.BooleanField(default=False)
    
    time_out_team_introduced = models.BooleanField(default=False)
    time_out_patient_procedure_site_confirmed = models.BooleanField(default=False)
    time_out_antibiotic_prophylaxis_confirmed = models.BooleanField(default=False)
    time_out_critical_events_reviewed = models.BooleanField(default=False)
    
    sign_out_procedure_recorded = models.BooleanField(default=False)
    sign_out_instrument_counts_confirmed = models.BooleanField(default=False)
    sign_out_specimen_labelled = models.BooleanField(default=False)
    sign_out_recovery_concerns_reviewed = models.BooleanField(default=False)
    
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_surgical_safety_checklists'

# Compatibility alias for legacy migrations
import uuid6 as _uuid6
def generate_uuidv7(): return _uuid6.uuid7()
