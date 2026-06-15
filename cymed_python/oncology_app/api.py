from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import OncologyTreatmentPlan

router = Router()

class OncologyTreatmentPlanSchema(ModelSchema):
    class Meta:
        model = OncologyTreatmentPlan
        fields = "__all__"

class OncologyTreatmentPlanCreateSchema(ModelSchema):
    class Meta:
        model = OncologyTreatmentPlan
        exclude = ["id", "created_at", "updated_at"]

@router.get("/oncologytreatmentplans", response=list[OncologyTreatmentPlanSchema])
def list_oncologytreatmentplans(request):
    return OncologyTreatmentPlan.objects.all()

@router.get("/oncologytreatmentplan/{id}", response=OncologyTreatmentPlanSchema)
def get_oncologytreatmentplan(request, id: str):
    return get_object_or_404(OncologyTreatmentPlan, id=id)

@router.post("/oncologytreatmentplans", response=OncologyTreatmentPlanSchema)
def create_oncologytreatmentplan(request, payload: OncologyTreatmentPlanCreateSchema):
    obj = OncologyTreatmentPlan.objects.create(**payload.dict())
    return obj

@router.put("/oncologytreatmentplan/{id}", response=OncologyTreatmentPlanSchema)
def update_oncologytreatmentplan(request, id: str, payload: OncologyTreatmentPlanCreateSchema):
    obj = get_object_or_404(OncologyTreatmentPlan, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/oncologytreatmentplan/{id}")
def delete_oncologytreatmentplan(request, id: str):
    obj = get_object_or_404(OncologyTreatmentPlan, id=id)
    obj.delete()
    return {"success": True}

