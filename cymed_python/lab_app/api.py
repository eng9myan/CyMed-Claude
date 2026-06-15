from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import LabOrder, LabPanel, LabSpecimen, LabResult

router = Router()

class LabOrderSchema(ModelSchema):
    class Meta:
        model = LabOrder
        fields = "__all__"

class LabOrderCreateSchema(ModelSchema):
    class Meta:
        model = LabOrder
        exclude = ["id"]

class LabSpecimenSchema(ModelSchema):
    class Meta:
        model = LabSpecimen
        fields = "__all__"

class LabResultSchema(ModelSchema):
    class Meta:
        model = LabResult
        fields = "__all__"

@router.get("/laborders", response=list[LabOrderSchema])
def list_laborders(request):
    return LabOrder.objects.all()

@router.get("/laborder/{id}", response=LabOrderSchema)
def get_laborder(request, id: str):
    return get_object_or_404(LabOrder, id=id)

@router.post("/laborders", response=LabOrderSchema)
def create_laborder(request, payload: LabOrderCreateSchema):
    obj = LabOrder.objects.create(**payload.dict())
    return obj

@router.put("/laborder/{id}", response=LabOrderSchema)
def update_laborder(request, id: str, payload: LabOrderCreateSchema):
    obj = get_object_or_404(LabOrder, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/laborder/{id}")
def delete_laborder(request, id: str):
    obj = get_object_or_404(LabOrder, id=id)
    obj.delete()
    return {"success": True}

from .services import LabWorkflowService
from ninja import Schema

class ResultItemPayload(Schema):
    test_name: str
    value: str
    unit: str | None = None
    reference_range: str | None = None
    flag: str | None = "NORMAL"

class LabResultsPayload(Schema):
    results: list[ResultItemPayload]

class CollectSamplePayload(Schema):
    specimen_type: str
    barcode: str

@router.post("/laborder/{id}/collect", response=LabSpecimenSchema)
def collect_lab_sample(request, id: str, payload: CollectSamplePayload):
    obj = LabWorkflowService.collect_sample(
        order_id=id,
        specimen_type=payload.specimen_type,
        barcode=payload.barcode,
        phlebotomist_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000")
    )
    return obj

@router.post("/labspecimen/{id}/analyzer", response=list[LabResultSchema])
def record_analyzer_results(request, id: str, payload: LabResultsPayload):
    results = LabWorkflowService.record_analyzer_results(
        sample_id=id,
        results_data=payload.dict()['results'],
        technician_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000")
    )
    return results

@router.post("/laborder/{id}/validate", response=LabOrderSchema)
def validate_lab_results(request, id: str):
    obj = LabWorkflowService.clinical_validation(
        order_id=id,
        pathologist_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000")
    )
    return obj

@router.post("/laborder/{id}/results", response=LabOrderSchema)
def submit_lab_results(request, id: str, payload: LabResultsPayload):
    # Find the specimen for this order to pass to record_analyzer_results
    specimen = LabSpecimen.objects.filter(lab_order_id=id).first()
    if specimen:
        LabWorkflowService.record_analyzer_results(
            sample_id=specimen.id,
            results_data=payload.dict()['results'],
            technician_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000")
        )
    return get_object_or_404(LabOrder, id=id)

class LabPanelSchema(ModelSchema):
    class Meta:
        model = LabPanel
        fields = "__all__"

class LabPanelCreateSchema(ModelSchema):
    class Meta:
        model = LabPanel
        exclude = ["id"]

@router.get("/labpanels", response=list[LabPanelSchema])
def list_labpanels(request):
    return LabPanel.objects.all()

@router.get("/labpanel/{id}", response=LabPanelSchema)
def get_labpanel(request, id: str):
    return get_object_or_404(LabPanel, id=id)

@router.post("/labpanels", response=LabPanelSchema)
def create_labpanel(request, payload: LabPanelCreateSchema):
    obj = LabPanel.objects.create(**payload.dict())
    return obj

@router.put("/labpanel/{id}", response=LabPanelSchema)
def update_labpanel(request, id: str, payload: LabPanelCreateSchema):
    obj = get_object_or_404(LabPanel, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/labpanel/{id}")
def delete_labpanel(request, id: str):
    obj = get_object_or_404(LabPanel, id=id)
    obj.delete()
    return {"success": True}

class LabSpecimenSchema(ModelSchema):
    class Meta:
        model = LabSpecimen
        fields = "__all__"

class LabSpecimenCreateSchema(ModelSchema):
    class Meta:
        model = LabSpecimen
        exclude = ["id"]

@router.get("/labspecimens", response=list[LabSpecimenSchema])
def list_labspecimens(request):
    return LabSpecimen.objects.all()

@router.get("/labspecimen/{id}", response=LabSpecimenSchema)
def get_labspecimen(request, id: str):
    return get_object_or_404(LabSpecimen, id=id)

@router.post("/labspecimens", response=LabSpecimenSchema)
def create_labspecimen(request, payload: LabSpecimenCreateSchema):
    obj = LabSpecimen.objects.create(**payload.dict())
    return obj

@router.put("/labspecimen/{id}", response=LabSpecimenSchema)
def update_labspecimen(request, id: str, payload: LabSpecimenCreateSchema):
    obj = get_object_or_404(LabSpecimen, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/labspecimen/{id}")
def delete_labspecimen(request, id: str):
    obj = get_object_or_404(LabSpecimen, id=id)
    obj.delete()
    return {"success": True}

class LabResultSchema(ModelSchema):
    class Meta:
        model = LabResult
        fields = "__all__"

class LabResultCreateSchema(ModelSchema):
    class Meta:
        model = LabResult
        exclude = ["id"]

@router.get("/labresults", response=list[LabResultSchema])
def list_labresults(request):
    return LabResult.objects.all()

@router.get("/labresult/{id}", response=LabResultSchema)
def get_labresult(request, id: str):
    return get_object_or_404(LabResult, id=id)

@router.post("/labresults", response=LabResultSchema)
def create_labresult(request, payload: LabResultCreateSchema):
    obj = LabResult.objects.create(**payload.dict())
    return obj

@router.put("/labresult/{id}", response=LabResultSchema)
def update_labresult(request, id: str, payload: LabResultCreateSchema):
    obj = get_object_or_404(LabResult, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/labresult/{id}")
def delete_labresult(request, id: str):
    obj = get_object_or_404(LabResult, id=id)
    obj.delete()
    return {"success": True}

