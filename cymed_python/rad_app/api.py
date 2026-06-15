from ninja import Router, ModelSchema
from django.shortcuts import get_object_or_404
from .models import ImagingOrder, ImagingStudy, ImagingReport

router = Router()

class ImagingOrderSchema(ModelSchema):
    class Meta:
        model = ImagingOrder
        fields = "__all__"

class ImagingOrderCreateSchema(ModelSchema):
    class Meta:
        model = ImagingOrder
        exclude = ["id"]

class ImagingStudySchema(ModelSchema):
    class Meta:
        model = ImagingStudy
        fields = "__all__"

class ImagingReportSchema(ModelSchema):
    class Meta:
        model = ImagingReport
        fields = "__all__"

@router.get("/imagingorders", response=list[ImagingOrderSchema])
def list_imagingorders(request):
    return ImagingOrder.objects.all()

@router.get("/imagingorder/{id}", response=ImagingOrderSchema)
def get_imagingorder(request, id: str):
    return get_object_or_404(ImagingOrder, id=id)

@router.post("/imagingorders", response=ImagingOrderSchema)
def create_imagingorder(request, payload: ImagingOrderCreateSchema):
    obj = ImagingOrder.objects.create(**payload.dict())
    return obj

@router.put("/imagingorder/{id}", response=ImagingOrderSchema)
def update_imagingorder(request, id: str, payload: ImagingOrderCreateSchema):
    obj = get_object_or_404(ImagingOrder, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/imagingorder/{id}")
def delete_imagingorder(request, id: str):
    obj = get_object_or_404(ImagingOrder, id=id)
    obj.delete()
    return {"success": True}

from .services import RadiologyWorkflowService
from ninja import Schema

class SchedulePayload(Schema):
    scheduled_time: str

@router.post("/imagingorder/{id}/schedule", response=ImagingOrderSchema)
def schedule_imaging(request, id: str, payload: SchedulePayload):
    obj = RadiologyWorkflowService.schedule_imaging(order_id=id, scheduled_time=payload.scheduled_time)
    return obj

class CompletePayload(Schema):
    dicom_uid: str

@router.post("/imagingorder/{id}/complete", response=ImagingStudySchema)
def complete_imaging(request, id: str, payload: CompletePayload):
    obj = RadiologyWorkflowService.complete_imaging(
        order_id=id,
        technician_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000"),
        dicom_uid=payload.dicom_uid
    )
    return obj

class InterpretationPayload(Schema):
    findings: str
    impression: str

@router.post("/imagingorder/{id}/interpret")
def submit_interpretation(request, id: str, payload: InterpretationPayload):
    report = RadiologyWorkflowService.submit_interpretation(
        order_id=id,
        radiologist_id=getattr(request.user, 'id', "00000000-0000-0000-0000-000000000000"),
        findings=payload.findings,
        impression=payload.impression
    )
    return {"success": True, "report_id": str(report.id)}

class ImagingStudySchema(ModelSchema):
    class Meta:
        model = ImagingStudy
        fields = "__all__"

class ImagingStudyCreateSchema(ModelSchema):
    class Meta:
        model = ImagingStudy
        exclude = ["id"]

@router.get("/imagingstudys", response=list[ImagingStudySchema])
def list_imagingstudys(request):
    return ImagingStudy.objects.all()

@router.get("/imagingstudy/{id}", response=ImagingStudySchema)
def get_imagingstudy(request, id: str):
    return get_object_or_404(ImagingStudy, id=id)

@router.post("/imagingstudys", response=ImagingStudySchema)
def create_imagingstudy(request, payload: ImagingStudyCreateSchema):
    obj = ImagingStudy.objects.create(**payload.dict())
    return obj

@router.put("/imagingstudy/{id}", response=ImagingStudySchema)
def update_imagingstudy(request, id: str, payload: ImagingStudyCreateSchema):
    obj = get_object_or_404(ImagingStudy, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/imagingstudy/{id}")
def delete_imagingstudy(request, id: str):
    obj = get_object_or_404(ImagingStudy, id=id)
    obj.delete()
    return {"success": True}

class ImagingReportSchema(ModelSchema):
    class Meta:
        model = ImagingReport
        fields = "__all__"

class ImagingReportCreateSchema(ModelSchema):
    class Meta:
        model = ImagingReport
        exclude = ["id"]

@router.get("/imagingreports", response=list[ImagingReportSchema])
def list_imagingreports(request):
    return ImagingReport.objects.all()

@router.get("/imagingreport/{id}", response=ImagingReportSchema)
def get_imagingreport(request, id: str):
    return get_object_or_404(ImagingReport, id=id)

@router.post("/imagingreports", response=ImagingReportSchema)
def create_imagingreport(request, payload: ImagingReportCreateSchema):
    obj = ImagingReport.objects.create(**payload.dict())
    return obj

@router.put("/imagingreport/{id}", response=ImagingReportSchema)
def update_imagingreport(request, id: str, payload: ImagingReportCreateSchema):
    obj = get_object_or_404(ImagingReport, id=id)
    for attr, value in payload.dict().items():
        setattr(obj, attr, value)
    obj.save()
    return obj

@router.delete("/imagingreport/{id}")
def delete_imagingreport(request, id: str):
    obj = get_object_or_404(ImagingReport, id=id)
    obj.delete()
    return {"success": True}

