from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.utils import timezone
from typing import Optional

from .models import PatientSatisfactionSurvey, Referral, PatientOutreach

router = Router()


# ── Satisfaction Surveys ──────────────────────────────────────────────────────

class SurveyOut(ModelSchema):
    class Meta:
        model  = PatientSatisfactionSurvey
        fields = ["id", "patient_id", "survey_type", "overall_score", "nps_score", "submitted_at"]

class SurveyIn(Schema):
    patient_id:   str
    encounter_id: Optional[str] = None
    survey_type:  str
    overall_score: Optional[int] = None
    nps_score:    Optional[int] = None
    responses:    dict = {}
    comments:     str = ""

@router.get("/surveys", response=list[SurveyOut])
def list_surveys(request, patient_id: str = "", survey_type: str = ""):
    qs = PatientSatisfactionSurvey.objects.all()
    if patient_id:
        qs = qs.filter(patient_id=patient_id)
    if survey_type:
        qs = qs.filter(survey_type=survey_type)
    return list(qs[:200])

@router.post("/surveys", response=SurveyOut)
def submit_survey(request, payload: SurveyIn):
    return PatientSatisfactionSurvey.objects.create(**payload.dict())

@router.get("/surveys/nps-summary")
def nps_summary(request, facility_id: str = ""):
    from django.db.models import Avg, Count
    qs = PatientSatisfactionSurvey.objects.filter(nps_score__isnull=False)
    stats = qs.aggregate(avg_nps=Avg("nps_score"), total=Count("id"))
    promoters = qs.filter(nps_score__gte=9).count()
    detractors = qs.filter(nps_score__lte=6).count()
    total = stats["total"] or 1
    nps = round(((promoters - detractors) / total) * 100, 1)
    return {"nps": nps, "avg_score": stats["avg_nps"], "total_responses": total}


# ── Referrals ─────────────────────────────────────────────────────────────────

class ReferralOut(ModelSchema):
    class Meta:
        model  = Referral
        fields = ["id", "patient_id", "specialty", "priority", "status", "referred_at"]

class ReferralIn(Schema):
    patient_id:         str
    referring_provider: str
    receiving_provider: Optional[str] = None
    receiving_facility: Optional[str] = None
    specialty:          str
    reason:             str
    priority:           str = "routine"

@router.get("/referrals", response=list[ReferralOut])
def list_referrals(request, patient_id: str = "", status: str = ""):
    qs = Referral.objects.all()
    if patient_id:
        qs = qs.filter(patient_id=patient_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/referrals", response=ReferralOut)
def create_referral(request, payload: ReferralIn):
    return Referral.objects.create(**payload.dict())

@router.post("/referrals/{ref_id}/accept")
def accept_referral(request, ref_id: str):
    ref = get_object_or_404(Referral, id=ref_id, status="pending")
    ref.status = "accepted"
    ref.save(update_fields=["status"])
    return {"status": "accepted"}

@router.post("/referrals/{ref_id}/complete")
def complete_referral(request, ref_id: str):
    ref = get_object_or_404(Referral, id=ref_id)
    ref.status       = "completed"
    ref.completed_at = timezone.now()
    ref.save(update_fields=["status", "completed_at"])
    return {"status": "completed"}


# ── Patient Outreach ──────────────────────────────────────────────────────────

class OutreachOut(ModelSchema):
    class Meta:
        model  = PatientOutreach
        fields = ["id", "patient_id", "outreach_type", "channel", "scheduled_at", "response"]

class OutreachIn(Schema):
    patient_id:    str
    outreach_type: str
    channel:       str
    message:       str
    scheduled_at:  str

@router.get("/outreach", response=list[OutreachOut])
def list_outreach(request, patient_id: str = "", response: str = ""):
    qs = PatientOutreach.objects.all()
    if patient_id:
        qs = qs.filter(patient_id=patient_id)
    if response:
        qs = qs.filter(response=response)
    return list(qs[:200])

@router.post("/outreach", response=OutreachOut)
def schedule_outreach(request, payload: OutreachIn):
    return PatientOutreach.objects.create(**payload.dict())

@router.post("/outreach/{oid}/mark-sent")
def mark_sent(request, oid: str):
    o = get_object_or_404(PatientOutreach, id=oid)
    o.sent_at  = timezone.now()
    o.response = "delivered"
    o.save(update_fields=["sent_at", "response"])
    return {"response": "delivered"}
