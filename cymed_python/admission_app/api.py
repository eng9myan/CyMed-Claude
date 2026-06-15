from ninja import Router, Schema
from uuid import UUID
from .services import admit_patient, discharge_patient, transfer_patient
from typing import Optional

router = Router(tags=["Admission"])

class AdmitPayload(Schema):
    patient_id: UUID
    provider_id: UUID
    bed_id: Optional[UUID] = None

class TransferPayload(Schema):
    new_bed_id: UUID
    provider_id: UUID

@router.post("/admit")
def api_admit_patient(request, payload: AdmitPayload):
    admission = admit_patient(
        patient_id=payload.patient_id,
        provider_id=payload.provider_id,
        bed_id=payload.bed_id
    )
    return {"status": "success", "admission_id": str(admission.id)}

@router.post("/{admission_id}/transfer")
def api_transfer_patient(request, admission_id: UUID, payload: TransferPayload):
    admission = transfer_patient(
        admission_id=admission_id,
        new_bed_id=payload.new_bed_id,
        provider_id=payload.provider_id
    )
    return {"status": "success", "admission_id": str(admission.id)}

@router.post("/{admission_id}/discharge")
def api_discharge_patient(request, admission_id: UUID):
    admission = discharge_patient(admission_id)
    return {"status": "success", "admission_id": str(admission.id)}
