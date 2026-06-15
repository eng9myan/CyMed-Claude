from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import DentalChart

router = Router()

class DentalChartSchema(ModelSchema):
    class Meta:
        model = DentalChart
        fields = "__all__"

class DentalChartCreateSchema(ModelSchema):
    class Meta:
        model = DentalChart
        exclude = ["id", "created_at", "updated_at"]

@router.get("/dentalcharts", response=list[DentalChartSchema])
def list_dentalcharts(request):
    return DentalChart.objects.all()

@router.get("/dentalchart/{id}", response=DentalChartSchema)
def get_dentalchart(request, id: str):
    return get_object_or_404(DentalChart, id=id)

@router.post("/dentalcharts", response=DentalChartSchema)
def create_dentalchart(request, payload: DentalChartCreateSchema):
    obj = DentalChart.objects.create(**payload.dict())
    return obj

@router.put("/dentalchart/{id}", response=DentalChartSchema)
def update_dentalchart(request, id: str, payload: DentalChartCreateSchema):
    obj = get_object_or_404(DentalChart, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/dentalchart/{id}")
def delete_dentalchart(request, id: str):
    obj = get_object_or_404(DentalChart, id=id)
    obj.delete()
    return {"success": True}

