from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import GlobalPatient, FacilityMRN, ExternalIdentifier, PatientMergeLog, Patient, Encounter, ClinicalNote, Condition, Allergy

router = Router()

class GlobalPatientSchema(ModelSchema):
    class Meta:
        model = GlobalPatient
        fields = "__all__"

class GlobalPatientCreateSchema(ModelSchema):
    class Meta:
        model = GlobalPatient
        exclude = ["id", "created_at", "updated_at"]

@router.get("/globalpatients", response=list[GlobalPatientSchema])
def list_globalpatients(request):
    return GlobalPatient.objects.all()

@router.get("/globalpatient/{id}", response=GlobalPatientSchema)
def get_globalpatient(request, id: str):
    return get_object_or_404(GlobalPatient, id=id)

@router.post("/globalpatients", response=GlobalPatientSchema)
def create_globalpatient(request, payload: GlobalPatientCreateSchema):
    obj = GlobalPatient.objects.create(**payload.dict())
    return obj

@router.put("/globalpatient/{id}", response=GlobalPatientSchema)
def update_globalpatient(request, id: str, payload: GlobalPatientCreateSchema):
    obj = get_object_or_404(GlobalPatient, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/globalpatient/{id}")
def delete_globalpatient(request, id: str):
    obj = get_object_or_404(GlobalPatient, id=id)
    obj.delete()
    return {"success": True}

class FacilityMRNSchema(ModelSchema):
    class Meta:
        model = FacilityMRN
        fields = "__all__"

class FacilityMRNCreateSchema(ModelSchema):
    class Meta:
        model = FacilityMRN
        exclude = ["id", "created_at"]

@router.get("/facilitymrns", response=list[FacilityMRNSchema])
def list_facilitymrns(request):
    return FacilityMRN.objects.all()

@router.get("/facilitymrn/{id}", response=FacilityMRNSchema)
def get_facilitymrn(request, id: str):
    return get_object_or_404(FacilityMRN, id=id)

@router.post("/facilitymrns", response=FacilityMRNSchema)
def create_facilitymrn(request, payload: FacilityMRNCreateSchema):
    obj = FacilityMRN.objects.create(**payload.dict())
    return obj

@router.put("/facilitymrn/{id}", response=FacilityMRNSchema)
def update_facilitymrn(request, id: str, payload: FacilityMRNCreateSchema):
    obj = get_object_or_404(FacilityMRN, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/facilitymrn/{id}")
def delete_facilitymrn(request, id: str):
    obj = get_object_or_404(FacilityMRN, id=id)
    obj.delete()
    return {"success": True}

class ExternalIdentifierSchema(ModelSchema):
    class Meta:
        model = ExternalIdentifier
        fields = "__all__"

class ExternalIdentifierCreateSchema(ModelSchema):
    class Meta:
        model = ExternalIdentifier
        exclude = ["id", "created_at"]

@router.get("/externalidentifiers", response=list[ExternalIdentifierSchema])
def list_externalidentifiers(request):
    return ExternalIdentifier.objects.all()

@router.get("/externalidentifier/{id}", response=ExternalIdentifierSchema)
def get_externalidentifier(request, id: str):
    return get_object_or_404(ExternalIdentifier, id=id)

@router.post("/externalidentifiers", response=ExternalIdentifierSchema)
def create_externalidentifier(request, payload: ExternalIdentifierCreateSchema):
    obj = ExternalIdentifier.objects.create(**payload.dict())
    return obj

@router.put("/externalidentifier/{id}", response=ExternalIdentifierSchema)
def update_externalidentifier(request, id: str, payload: ExternalIdentifierCreateSchema):
    obj = get_object_or_404(ExternalIdentifier, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/externalidentifier/{id}")
def delete_externalidentifier(request, id: str):
    obj = get_object_or_404(ExternalIdentifier, id=id)
    obj.delete()
    return {"success": True}

class PatientMergeLogSchema(ModelSchema):
    class Meta:
        model = PatientMergeLog
        fields = "__all__"

class PatientMergeLogCreateSchema(ModelSchema):
    class Meta:
        model = PatientMergeLog
        exclude = ["id"]

@router.get("/patientmergelogs", response=list[PatientMergeLogSchema])
def list_patientmergelogs(request):
    return PatientMergeLog.objects.all()

@router.get("/patientmergelog/{id}", response=PatientMergeLogSchema)
def get_patientmergelog(request, id: str):
    return get_object_or_404(PatientMergeLog, id=id)

@router.post("/patientmergelogs", response=PatientMergeLogSchema)
def create_patientmergelog(request, payload: PatientMergeLogCreateSchema):
    obj = PatientMergeLog.objects.create(**payload.dict())
    return obj

@router.put("/patientmergelog/{id}", response=PatientMergeLogSchema)
def update_patientmergelog(request, id: str, payload: PatientMergeLogCreateSchema):
    obj = get_object_or_404(PatientMergeLog, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/patientmergelog/{id}")
def delete_patientmergelog(request, id: str):
    obj = get_object_or_404(PatientMergeLog, id=id)
    obj.delete()
    return {"success": True}

from ninja import Schema
import uuid

class PatientResponseSchema(Schema):
    id: uuid.UUID
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    mrn: str | None = None
    blood_type: str | None = None
    is_active: bool = True

    @staticmethod
    def resolve_first_name(obj):
        return obj.global_patient.master_demographics.get("first_name") if obj.global_patient else None

    @staticmethod
    def resolve_last_name(obj):
        return obj.global_patient.master_demographics.get("last_name") if obj.global_patient else None

    @staticmethod
    def resolve_date_of_birth(obj):
        return obj.global_patient.master_demographics.get("date_of_birth") if obj.global_patient else None

    @staticmethod
    def resolve_gender(obj):
        return obj.global_patient.master_demographics.get("gender") if obj.global_patient else None

    @staticmethod
    def resolve_mrn(obj):
        if obj.global_patient:
            mrn_record = obj.global_patient.facility_mrns.first()
            if mrn_record:
                return mrn_record.local_mrn
        return None

    @staticmethod
    def resolve_is_active(obj):
        return obj.global_patient.is_active if obj.global_patient else True

class PatientCreateSchema(Schema):
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    blood_type: str | None = None

@router.get("/patients", response=list[PatientResponseSchema])
def list_patients(request):
    qs = Patient.objects.select_related('global_patient').prefetch_related('global_patient__facility_mrns').all()
    tenant_context = getattr(request, 'tenant', {}) or {}
    facility_id = tenant_context.get('facility_id')
    if facility_id:
        qs = qs.filter(global_patient__facility_mrns__facility_id=facility_id)
    return qs

@router.get("/patient/{id}", response=PatientResponseSchema)
def get_patient(request, id: str):
    return get_object_or_404(Patient, id=id)

from .services import PatientWorkflowService

@router.post("/patients", response=PatientResponseSchema)
def create_patient(request, payload: PatientCreateSchema):
    tenant_context = getattr(request, 'tenant', {}) or {}
    tenant_context['user_id'] = getattr(request.user, 'id', None)
    
    obj = PatientWorkflowService.register_patient(payload.dict(), tenant_context)
    return obj

@router.put("/patient/{id}", response=PatientResponseSchema)
def update_patient(request, id: str, payload: PatientCreateSchema):
    obj = get_object_or_404(Patient, id=id)
    # TODO: Need a specialized service method for updating global demographics + MRN
    # for attr, value in payload.dict().items():
    #     setattr(obj, attr, value)
    # obj.save()
    return obj

@router.delete("/patient/{id}")
def delete_patient(request, id: str):
    obj = get_object_or_404(Patient, id=id)
    obj.delete()
    return {"success": True}

class EncounterResponseSchema(Schema):
    id: uuid.UUID
    patient: PatientResponseSchema
    facility_id: uuid.UUID | None = None
    encounter_type: str
    status: str

class EncounterCreateSchema(Schema):
    patient_id: uuid.UUID
    facility_id: uuid.UUID | None = None
    encounter_type: str
    status: str

@router.get("/encounters", response=list[EncounterResponseSchema])
def list_encounters(request):
    qs = Encounter.objects.select_related(
        'patient', 
        'patient__global_patient'
    ).prefetch_related(
        'patient__global_patient__facility_mrns'
    ).all()
    tenant_context = getattr(request, 'tenant', {}) or {}
    facility_id = tenant_context.get('facility_id')
    if facility_id:
        qs = qs.filter(facility_id=facility_id)
    return qs

@router.get("/encounter/{id}", response=EncounterResponseSchema)
def get_encounter(request, id: str):
    return get_object_or_404(Encounter, id=id)

@router.post("/encounters", response=EncounterResponseSchema)
def create_encounter(request, payload: EncounterCreateSchema):
    obj = Encounter.objects.create(**payload.dict())
    return obj

@router.put("/encounter/{id}", response=EncounterResponseSchema)
def update_encounter(request, id: str, payload: EncounterCreateSchema):
    obj = get_object_or_404(Encounter, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

class DiagnosisPayload(Schema):
    name: str

class MedicationPayload(Schema):
    name: str
    dosage: str
    route: str
    frequency: str
    duration_days: int | None = 7

class ConsultPayload(Schema):
    notes: str | None = None
    diagnoses: list[DiagnosisPayload] = []
    medications: list[MedicationPayload] = []
    lab_orders: list[str] = [] # list of panel names for prototype
    radiology_orders: list[str] = [] # list of modalities for prototype

from .services import DoctorWorkflowService

@router.post("/encounter/{id}/consult", response=EncounterResponseSchema)
def complete_consultation(request, id: str, payload: ConsultPayload):
    tenant_context = getattr(request, 'tenant', {}) or {}
    tenant_context['user_id'] = getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000") # Fallback
    
    obj = DoctorWorkflowService.complete_consultation(
        encounter_id=id,
        clinical_data=payload.dict(),
        tenant_context=tenant_context
    )
    return obj

@router.post("/encounter/{id}/discharge", response=EncounterResponseSchema)
def discharge_patient_endpoint(request, id: str):
    tenant_context = getattr(request, 'tenant', {}) or {}
    tenant_context['user_id'] = getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000") # Fallback
    
    obj = PatientWorkflowService.discharge_patient(
        encounter_id=id,
        tenant_context=tenant_context
    )
    return obj

@router.delete("/encounter/{id}")
def delete_encounter(request, id: str):
    obj = get_object_or_404(Encounter, id=id)
    obj.delete()
    return {"success": True}

class ClinicalNoteSchema(ModelSchema):
    class Meta:
        model = ClinicalNote
        fields = "__all__"

class ClinicalNoteCreateSchema(ModelSchema):
    class Meta:
        model = ClinicalNote
        exclude = ["id", "created_at"]

@router.get("/clinicalnotes", response=list[ClinicalNoteSchema])
def list_clinicalnotes(request):
    return ClinicalNote.objects.all()

@router.get("/clinicalnote/{id}", response=ClinicalNoteSchema)
def get_clinicalnote(request, id: str):
    return get_object_or_404(ClinicalNote, id=id)

@router.post("/clinicalnotes", response=ClinicalNoteSchema)
def create_clinicalnote(request, payload: ClinicalNoteCreateSchema):
    obj = ClinicalNote.objects.create(**payload.dict())
    return obj

@router.put("/clinicalnote/{id}", response=ClinicalNoteSchema)
def update_clinicalnote(request, id: str, payload: ClinicalNoteCreateSchema):
    obj = get_object_or_404(ClinicalNote, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/clinicalnote/{id}")
def delete_clinicalnote(request, id: str):
    obj = get_object_or_404(ClinicalNote, id=id)
    obj.delete()
    return {"success": True}

class ConditionSchema(ModelSchema):
    class Meta:
        model = Condition
        fields = "__all__"

class ConditionCreateSchema(ModelSchema):
    class Meta:
        model = Condition
        exclude = ["id", "created_at"]

@router.get("/conditions", response=list[ConditionSchema])
def list_conditions(request):
    return Condition.objects.all()

@router.get("/condition/{id}", response=ConditionSchema)
def get_condition(request, id: str):
    return get_object_or_404(Condition, id=id)

@router.post("/conditions", response=ConditionSchema)
def create_condition(request, payload: ConditionCreateSchema):
    obj = Condition.objects.create(**payload.dict())
    return obj

@router.put("/condition/{id}", response=ConditionSchema)
def update_condition(request, id: str, payload: ConditionCreateSchema):
    obj = get_object_or_404(Condition, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/condition/{id}")
def delete_condition(request, id: str):
    obj = get_object_or_404(Condition, id=id)
    obj.delete()
    return {"success": True}

class AllergySchema(ModelSchema):
    class Meta:
        model = Allergy
        fields = "__all__"

class AllergyCreateSchema(ModelSchema):
    class Meta:
        model = Allergy
        exclude = ["id", "created_at"]

@router.get("/allergys", response=list[AllergySchema])
def list_allergys(request):
    return Allergy.objects.all()

@router.get("/allergy/{id}", response=AllergySchema)
def get_allergy(request, id: str):
    return get_object_or_404(Allergy, id=id)

@router.post("/allergys", response=AllergySchema)
def create_allergy(request, payload: AllergyCreateSchema):
    obj = Allergy.objects.create(**payload.dict())
    return obj

@router.put("/allergy/{id}", response=AllergySchema)
def update_allergy(request, id: str, payload: AllergyCreateSchema):
    obj = get_object_or_404(Allergy, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/allergy/{id}")
def delete_allergy(request, id: str):
    obj = get_object_or_404(Allergy, id=id)
    obj.delete()
    return {"success": True}

