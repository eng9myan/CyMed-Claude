from ninja import Router, Schema
from uuid import UUID
from .services import record_vitals, record_assessment
from typing import Optional

router = Router(tags=["Nursing"])

class VitalsPayload(Schema):
    encounter_id: UUID
    nurse_id: UUID
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    blood_pressure: Optional[str] = None
    respiratory_rate: Optional[int] = None
    spo2: Optional[float] = None

class AssessmentPayload(Schema):
    encounter_id: UUID
    nurse_id: UUID
    assessment_type: str
    notes: str

@router.post("/vitals")
def api_record_vitals(request, payload: VitalsPayload):
    vitals = record_vitals(
        encounter_id=payload.encounter_id,
        nurse_id=payload.nurse_id,
        temperature=payload.temperature,
        heart_rate=payload.heart_rate,
        blood_pressure=payload.blood_pressure,
        respiratory_rate=payload.respiratory_rate,
        spo2=payload.spo2
    )
    return {"status": "success", "vitals_id": str(vitals.id)}

@router.post("/assessments")
def api_record_assessment(request, payload: AssessmentPayload):
    assessment = record_assessment(
        encounter_id=payload.encounter_id,
        nurse_id=payload.nurse_id,
        assessment_type=payload.assessment_type,
        notes=payload.notes
    )
    return {"status": "success", "assessment_id": str(assessment.id)}
