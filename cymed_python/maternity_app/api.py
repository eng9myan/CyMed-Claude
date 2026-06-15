from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import PregnancyRecord

router = Router()

class PregnancyRecordSchema(ModelSchema):
    class Meta:
        model = PregnancyRecord
        fields = "__all__"

class PregnancyRecordCreateSchema(ModelSchema):
    class Meta:
        model = PregnancyRecord
        exclude = ["id", "created_at", "updated_at"]

@router.get("/pregnancyrecords", response=list[PregnancyRecordSchema])
def list_pregnancyrecords(request):
    return PregnancyRecord.objects.all()

@router.get("/pregnancyrecord/{id}", response=PregnancyRecordSchema)
def get_pregnancyrecord(request, id: str):
    return get_object_or_404(PregnancyRecord, id=id)

@router.post("/pregnancyrecords", response=PregnancyRecordSchema)
def create_pregnancyrecord(request, payload: PregnancyRecordCreateSchema):
    obj = PregnancyRecord.objects.create(**payload.dict())
    return obj

@router.put("/pregnancyrecord/{id}", response=PregnancyRecordSchema)
def update_pregnancyrecord(request, id: str, payload: PregnancyRecordCreateSchema):
    obj = get_object_or_404(PregnancyRecord, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/pregnancyrecord/{id}")
def delete_pregnancyrecord(request, id: str):
    obj = get_object_or_404(PregnancyRecord, id=id)
    obj.delete()
    return {"success": True}

