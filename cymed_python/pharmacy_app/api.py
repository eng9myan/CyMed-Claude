from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import MedicationOrder, PharmacyIntervention, MedicationAdministration, SmartDispenseLog

router = Router()

class MedicationOrderSchema(ModelSchema):
    class Meta:
        model = MedicationOrder
        fields = "__all__"

class MedicationOrderCreateSchema(ModelSchema):
    class Meta:
        model = MedicationOrder
        exclude = ["id"]

@router.get("/medicationorders", response=list[MedicationOrderSchema])
def list_medicationorders(request):
    return MedicationOrder.objects.all()

@router.get("/medicationorder/{id}", response=MedicationOrderSchema)
def get_medicationorder(request, id: str):
    return get_object_or_404(MedicationOrder, id=id)

@router.post("/medicationorders", response=MedicationOrderSchema)
def create_medicationorder(request, payload: MedicationOrderCreateSchema):
    obj = MedicationOrder.objects.create(**payload.dict())
    return obj

@router.put("/medicationorder/{id}", response=MedicationOrderSchema)
def update_medicationorder(request, id: str, payload: MedicationOrderCreateSchema):
    obj = get_object_or_404(MedicationOrder, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/medicationorder/{id}")
def delete_medicationorder(request, id: str):
    obj = get_object_or_404(MedicationOrder, id=id)
    obj.delete()
    return {"success": True}

from .services import PharmacyWorkflowService
from ninja import Schema

class DispensePayload(Schema):
    quantity: float
    is_controlled: bool = False
    verified_by_id: str = None

@router.post("/medicationorder/{id}/dispense", response=MedicationOrderSchema)
def dispense_medicationorder(request, id: str, payload: DispensePayload):
    obj = PharmacyWorkflowService.dispense_medication(
        order_id=id,
        quantity=payload.quantity,
        pharmacist_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000"),
        is_controlled=payload.is_controlled,
        verified_by_id=payload.verified_by_id
    )
    return obj

class VerifyPayload(Schema):
    notes: str = ""
    status: str = "VERIFIED"

@router.post("/medicationorder/{id}/verify")
def verify_prescription(request, id: str, payload: VerifyPayload):
    log = PharmacyWorkflowService.verify_prescription(
        order_id=id,
        pharmacist_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000"),
        notes=payload.notes,
        status=payload.status
    )
    return {"success": True, "log_id": str(log.id)}

class PharmacyInterventionSchema(ModelSchema):
    class Meta:
        model = PharmacyIntervention
        fields = "__all__"

class PharmacyInterventionCreateSchema(ModelSchema):
    class Meta:
        model = PharmacyIntervention
        exclude = ["id", "created_at"]

@router.get("/pharmacyinterventions", response=list[PharmacyInterventionSchema])
def list_pharmacyinterventions(request):
    return PharmacyIntervention.objects.all()

@router.get("/pharmacyintervention/{id}", response=PharmacyInterventionSchema)
def get_pharmacyintervention(request, id: str):
    return get_object_or_404(PharmacyIntervention, id=id)

@router.post("/pharmacyinterventions", response=PharmacyInterventionSchema)
def create_pharmacyintervention(request, payload: PharmacyInterventionCreateSchema):
    obj = PharmacyIntervention.objects.create(**payload.dict())
    return obj

@router.put("/pharmacyintervention/{id}", response=PharmacyInterventionSchema)
def update_pharmacyintervention(request, id: str, payload: PharmacyInterventionCreateSchema):
    obj = get_object_or_404(PharmacyIntervention, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/pharmacyintervention/{id}")
def delete_pharmacyintervention(request, id: str):
    obj = get_object_or_404(PharmacyIntervention, id=id)
    obj.delete()
    return {"success": True}

class MedicationAdministrationSchema(ModelSchema):
    class Meta:
        model = MedicationAdministration
        fields = "__all__"

class MedicationAdministrationCreateSchema(ModelSchema):
    class Meta:
        model = MedicationAdministration
        exclude = ["id"]

@router.get("/medicationadministrations", response=list[MedicationAdministrationSchema])
def list_medicationadministrations(request):
    return MedicationAdministration.objects.all()

@router.get("/medicationadministration/{id}", response=MedicationAdministrationSchema)
def get_medicationadministration(request, id: str):
    return get_object_or_404(MedicationAdministration, id=id)

@router.post("/medicationadministrations", response=MedicationAdministrationSchema)
def create_medicationadministration(request, payload: MedicationAdministrationCreateSchema):
    obj = MedicationAdministration.objects.create(**payload.dict())
    return obj

@router.put("/medicationadministration/{id}", response=MedicationAdministrationSchema)
def update_medicationadministration(request, id: str, payload: MedicationAdministrationCreateSchema):
    obj = get_object_or_404(MedicationAdministration, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/medicationadministration/{id}")
def delete_medicationadministration(request, id: str):
    obj = get_object_or_404(MedicationAdministration, id=id)
    obj.delete()
    return {"success": True}

class SmartDispenseLogSchema(ModelSchema):
    class Meta:
        model = SmartDispenseLog
        fields = "__all__"

class SmartDispenseLogCreateSchema(ModelSchema):
    class Meta:
        model = SmartDispenseLog
        exclude = ["id"]

@router.get("/smartdispenselogs", response=list[SmartDispenseLogSchema])
def list_smartdispenselogs(request):
    return SmartDispenseLog.objects.all()

@router.get("/smartdispenselog/{id}", response=SmartDispenseLogSchema)
def get_smartdispenselog(request, id: str):
    return get_object_or_404(SmartDispenseLog, id=id)

@router.post("/smartdispenselogs", response=SmartDispenseLogSchema)
def create_smartdispenselog(request, payload: SmartDispenseLogCreateSchema):
    obj = SmartDispenseLog.objects.create(**payload.dict())
    return obj

@router.put("/smartdispenselog/{id}", response=SmartDispenseLogSchema)
def update_smartdispenselog(request, id: str, payload: SmartDispenseLogCreateSchema):
    obj = get_object_or_404(SmartDispenseLog, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/smartdispenselog/{id}")
def delete_smartdispenselog(request, id: str):
    obj = get_object_or_404(SmartDispenseLog, id=id)
    obj.delete()
    return {"success": True}

