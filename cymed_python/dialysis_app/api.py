from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import DialysisSession

router = Router()

class DialysisSessionSchema(ModelSchema):
    class Meta:
        model = DialysisSession
        fields = "__all__"

class DialysisSessionCreateSchema(ModelSchema):
    class Meta:
        model = DialysisSession
        exclude = ["id", "created_at", "updated_at"]

@router.get("/dialysissessions", response=list[DialysisSessionSchema])
def list_dialysissessions(request):
    return DialysisSession.objects.all()

@router.get("/dialysissession/{id}", response=DialysisSessionSchema)
def get_dialysissession(request, id: str):
    return get_object_or_404(DialysisSession, id=id)

@router.post("/dialysissessions", response=DialysisSessionSchema)
def create_dialysissession(request, payload: DialysisSessionCreateSchema):
    obj = DialysisSession.objects.create(**payload.dict())
    return obj

@router.put("/dialysissession/{id}", response=DialysisSessionSchema)
def update_dialysissession(request, id: str, payload: DialysisSessionCreateSchema):
    obj = get_object_or_404(DialysisSession, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/dialysissession/{id}")
def delete_dialysissession(request, id: str):
    obj = get_object_or_404(DialysisSession, id=id)
    obj.delete()
    return {"success": True}

