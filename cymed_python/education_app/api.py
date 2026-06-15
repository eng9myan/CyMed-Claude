from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import StudentRotation

router = Router()

class StudentRotationSchema(ModelSchema):
    class Meta:
        model = StudentRotation
        fields = "__all__"

class StudentRotationCreateSchema(ModelSchema):
    class Meta:
        model = StudentRotation
        exclude = ["id", "created_at", "updated_at"]

@router.get("/studentrotations", response=list[StudentRotationSchema])
def list_studentrotations(request):
    return StudentRotation.objects.all()

@router.get("/studentrotation/{id}", response=StudentRotationSchema)
def get_studentrotation(request, id: str):
    return get_object_or_404(StudentRotation, id=id)

@router.post("/studentrotations", response=StudentRotationSchema)
def create_studentrotation(request, payload: StudentRotationCreateSchema):
    obj = StudentRotation.objects.create(**payload.dict())
    return obj

@router.put("/studentrotation/{id}", response=StudentRotationSchema)
def update_studentrotation(request, id: str, payload: StudentRotationCreateSchema):
    obj = get_object_or_404(StudentRotation, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/studentrotation/{id}")
def delete_studentrotation(request, id: str):
    obj = get_object_or_404(StudentRotation, id=id)
    obj.delete()
    return {"success": True}

