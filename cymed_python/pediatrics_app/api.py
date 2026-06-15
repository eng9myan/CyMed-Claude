from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import GrowthChartRecord

router = Router()

class GrowthChartRecordSchema(ModelSchema):
    class Meta:
        model = GrowthChartRecord
        fields = "__all__"

class GrowthChartRecordCreateSchema(ModelSchema):
    class Meta:
        model = GrowthChartRecord
        exclude = ["id", "created_at", "updated_at"]

@router.get("/growthchartrecords", response=list[GrowthChartRecordSchema])
def list_growthchartrecords(request):
    return GrowthChartRecord.objects.all()

@router.get("/growthchartrecord/{id}", response=GrowthChartRecordSchema)
def get_growthchartrecord(request, id: str):
    return get_object_or_404(GrowthChartRecord, id=id)

@router.post("/growthchartrecords", response=GrowthChartRecordSchema)
def create_growthchartrecord(request, payload: GrowthChartRecordCreateSchema):
    obj = GrowthChartRecord.objects.create(**payload.dict())
    return obj

@router.put("/growthchartrecord/{id}", response=GrowthChartRecordSchema)
def update_growthchartrecord(request, id: str, payload: GrowthChartRecordCreateSchema):
    obj = get_object_or_404(GrowthChartRecord, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/growthchartrecord/{id}")
def delete_growthchartrecord(request, id: str):
    obj = get_object_or_404(GrowthChartRecord, id=id)
    obj.delete()
    return {"success": True}

