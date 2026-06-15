from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import EcgRecord

router = Router()

class EcgRecordSchema(ModelSchema):
    class Meta:
        model = EcgRecord
        fields = "__all__"

class EcgRecordCreateSchema(ModelSchema):
    class Meta:
        model = EcgRecord
        exclude = ["id", "created_at", "updated_at"]

@router.get("/ecgrecords", response=list[EcgRecordSchema])
def list_ecgrecords(request):
    return EcgRecord.objects.all()

@router.get("/ecgrecord/{id}", response=EcgRecordSchema)
def get_ecgrecord(request, id: str):
    return get_object_or_404(EcgRecord, id=id)

@router.post("/ecgrecords", response=EcgRecordSchema)
def create_ecgrecord(request, payload: EcgRecordCreateSchema):
    obj = EcgRecord.objects.create(**payload.dict())
    return obj

@router.put("/ecgrecord/{id}", response=EcgRecordSchema)
def update_ecgrecord(request, id: str, payload: EcgRecordCreateSchema):
    obj = get_object_or_404(EcgRecord, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/ecgrecord/{id}")
def delete_ecgrecord(request, id: str):
    obj = get_object_or_404(EcgRecord, id=id)
    obj.delete()
    return {"success": True}

