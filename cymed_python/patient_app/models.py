import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

# --- EMPI DOMAIN ---
class GlobalPatient(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    global_patient_id = models.CharField(max_length=255, unique=True, help_text="Enterprise-wide unique patient identifier")
    national_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    passport_number = models.CharField(max_length=255, null=True, blank=True)
    master_demographics = models.JSONField(help_text="Core demographic data (Name, DOB, Gender, etc.)")
    identity_confidence_score = models.FloatField(default=1.0)
    is_active = models.BooleanField(default=True)
    merge_status = models.CharField(max_length=50, default='UNMERGED')
    surviving_patient = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='merged_records')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'global_patients'

class FacilityMRN(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient = models.ForeignKey(GlobalPatient, on_delete=models.CASCADE, related_name='facility_mrns')
    facility_id = models.UUIDField(null=True, blank=True)
    local_mrn = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'facility_mrns'
        unique_together = ('facility_id', 'local_mrn')

class ExternalIdentifier(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient = models.ForeignKey(GlobalPatient, on_delete=models.CASCADE, related_name='external_identifiers')
    assigning_authority = models.CharField(max_length=255)
    identifier_value = models.CharField(max_length=255)
    identifier_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'external_identifiers'

class PatientMergeLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    surviving_patient = models.ForeignKey(GlobalPatient, on_delete=models.CASCADE, related_name='merge_survivor_logs')
    non_surviving_patient = models.ForeignKey(GlobalPatient, on_delete=models.CASCADE, related_name='merge_victim_logs')
    merged_by = models.UUIDField()
    merged_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(null=True, blank=True)
    unmerged = models.BooleanField(default=False)

    class Meta:
        db_table = 'patient_merge_logs'

# --- CLINICAL CORE DOMAIN ---
class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    global_patient = models.OneToOneField(GlobalPatient, on_delete=models.CASCADE, related_name='clinical_record', null=True)
    primary_care_physician_id = models.UUIDField(null=True, blank=True)
    blood_type = models.CharField(max_length=10, null=True, blank=True)
    organ_donor_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clinical_patients'

class Encounter(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='encounters')
    facility_id = models.UUIDField(null=True, blank=True)
    encounter_type = models.CharField(max_length=50) # INPATIENT, OUTPATIENT, EMERGENCY
    status = models.CharField(max_length=50) # PLANNED, ARRIVED, TRIAGED, IN_PROGRESS, DISCHARGED
    attending_physician_id = models.UUIDField(null=True, blank=True)
    admitted_at = models.DateTimeField(null=True, blank=True)
    discharged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clinical_encounters'
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['facility_id', 'status']),
        ]

class ClinicalNote(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='notes')
    author_id = models.UUIDField()
    note_type = models.CharField(max_length=100) # e.g. 'Progress Note', 'Discharge Summary'
    content = models.TextField()
    is_signed = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clinical_notes'

class Condition(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='conditions')
    encounter = models.ForeignKey(Encounter, on_delete=models.SET_NULL, null=True, blank=True)
    terminology_concept_id = models.UUIDField(help_text="Reference to Terminology App Concept (ICD-11)", null=True, blank=True)
    condition_name = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50) # ACTIVE, RESOLVED, CHRONIC
    diagnosed_at = models.DateTimeField(null=True, blank=True)
    recorded_by = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clinical_conditions'

class Allergy(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='allergies')
    terminology_concept_id = models.UUIDField(help_text="Reference to Terminology App Concept (RxNorm/SNOMED)")
    allergy_type = models.CharField(max_length=50) # DRUG, FOOD, ENVIRONMENTAL
    severity = models.CharField(max_length=50) # MILD, MODERATE, SEVERE, ANAPHYLAXIS
    reaction_description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50) # ACTIVE, INACTIVE
    recorded_by = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clinical_allergies'