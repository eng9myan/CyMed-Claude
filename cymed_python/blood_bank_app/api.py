from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import BloodBag

router = Router()

class BloodBagSchema(ModelSchema):
    class Meta:
        model = BloodBag
        fields = "__all__"

class BloodBagCreateSchema(ModelSchema):
    class Meta:
        model = BloodBag
        exclude = ["id", "created_at", "updated_at"]

@router.get("/bloodbags", response=list[BloodBagSchema])
def list_bloodbags(request):
    return BloodBag.objects.all()

@router.get("/bloodbag/{id}", response=BloodBagSchema)
def get_bloodbag(request, id: str):
    return get_object_or_404(BloodBag, id=id)

@router.post("/bloodbags", response=BloodBagSchema)
def create_bloodbag(request, payload: BloodBagCreateSchema):
    obj = BloodBag.objects.create(**payload.dict())
    return obj

@router.put("/bloodbag/{id}", response=BloodBagSchema)
def update_bloodbag(request, id: str, payload: BloodBagCreateSchema):
    obj = get_object_or_404(BloodBag, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/bloodbag/{id}")
def delete_bloodbag(request, id: str):
    obj = get_object_or_404(BloodBag, id=id)
    obj.delete()
    return {"success": True}

