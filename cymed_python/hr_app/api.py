from ninja import Router, Schema, ModelSchema
from django.shortcuts import get_object_or_404
from django.utils import timezone
from typing import Optional

from .models import (
    Department, Designation, HealthcareProfessional,
    Shift, DutyRoster, Attendance,
    LeaveType, LeaveRequest, PerformanceReview, TrainingRecord
)

router = Router()


# ── Departments & Designations ────────────────────────────────────────────────

class DeptOut(ModelSchema):
    class Meta:
        model  = Department
        fields = ["id", "name", "code"]

class DeptIn(Schema):
    facility_id: str
    name: str
    code: str = ""

@router.get("/departments", response=list[DeptOut])
def list_departments(request, facility_id: str):
    return list(Department.objects.filter(facility_id=facility_id))

@router.post("/departments", response=DeptOut)
def create_department(request, payload: DeptIn):
    return Department.objects.create(**payload.dict())


class DesigOut(ModelSchema):
    class Meta:
        model  = Designation
        fields = ["id", "name"]

@router.get("/designations", response=list[DesigOut])
def list_designations(request, department_id: str = ""):
    qs = Designation.objects.all()
    if department_id:
        qs = qs.filter(department_id=department_id)
    return list(qs)

@router.post("/designations", response=DesigOut)
def create_designation(request, department_id: str, name: str):
    return Designation.objects.create(department_id=department_id, name=name)


# ── Staff ─────────────────────────────────────────────────────────────────────

class StaffOut(ModelSchema):
    class Meta:
        model  = HealthcareProfessional
        fields = ["id", "employee_id", "basic_salary", "status", "joining_date"]

class StaffIn(Schema):
    user_id:        Optional[str] = None
    department_id:  Optional[str] = None
    designation_id: Optional[str] = None
    employee_id:    str
    joining_date:   Optional[str] = None
    basic_salary:   float = 0
    status:         str = "Active"

@router.get("/staff", response=list[StaffOut])
def list_staff(request, department_id: str = "", status: str = "Active"):
    qs = HealthcareProfessional.objects.filter(status=status)
    if department_id:
        qs = qs.filter(department_id=department_id)
    return list(qs[:200])

@router.post("/staff", response=StaffOut)
def create_staff(request, payload: StaffIn):
    return HealthcareProfessional.objects.create(**payload.dict())


# ── Shifts & Rosters ──────────────────────────────────────────────────────────

class ShiftOut(ModelSchema):
    class Meta:
        model  = Shift
        fields = ["id", "name", "start_time", "end_time"]

@router.get("/shifts", response=list[ShiftOut])
def list_shifts(request):
    return list(Shift.objects.all())

@router.post("/shifts", response=ShiftOut)
def create_shift(request, name: str, start_time: str, end_time: str):
    return Shift.objects.create(name=name, start_time=start_time, end_time=end_time)

class RosterIn(Schema):
    professional_id: str
    shift_id:        str
    roster_date:     str

class RosterOut(ModelSchema):
    class Meta:
        model  = DutyRoster
        fields = ["id", "roster_date"]

@router.post("/roster", response=RosterOut)
def assign_roster(request, payload: RosterIn):
    return DutyRoster.objects.create(**payload.dict())

@router.get("/roster")
def get_roster(request, department_id: str = "", date_from: str = "", date_to: str = ""):
    qs = DutyRoster.objects.select_related("professional", "shift").all()
    if department_id:
        qs = qs.filter(professional__department_id=department_id)
    if date_from:
        qs = qs.filter(roster_date__gte=date_from)
    if date_to:
        qs = qs.filter(roster_date__lte=date_to)
    return list(qs.values("id", "professional__employee_id", "shift__name", "roster_date")[:200])


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceIn(Schema):
    professional_id: str
    date:            str
    clock_in:        Optional[str] = None
    clock_out:       Optional[str] = None
    status:          str = "Present"

class AttendanceOut(ModelSchema):
    class Meta:
        model  = Attendance
        fields = ["id", "date", "clock_in", "clock_out", "status"]

@router.post("/attendance", response=AttendanceOut)
def record_attendance(request, payload: AttendanceIn):
    obj, _ = Attendance.objects.update_or_create(
        professional_id=payload.professional_id, date=payload.date,
        defaults={"clock_in": payload.clock_in, "clock_out": payload.clock_out, "status": payload.status}
    )
    return obj

@router.get("/attendance")
def list_attendance(request, professional_id: str = "", date_from: str = "", date_to: str = ""):
    qs = Attendance.objects.all()
    if professional_id:
        qs = qs.filter(professional_id=professional_id)
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)
    return list(qs.values("id", "professional_id", "date", "clock_in", "clock_out", "status")[:500])


# ── Leave ─────────────────────────────────────────────────────────────────────

class LeaveTypeOut(ModelSchema):
    class Meta:
        model  = LeaveType
        fields = ["id", "name", "code", "annual_days", "is_paid", "requires_doc"]

@router.get("/leave-types", response=list[LeaveTypeOut])
def list_leave_types(request):
    return list(LeaveType.objects.all())

class LeaveRequestIn(Schema):
    professional_id: str
    leave_type_id:   str
    start_date:      str
    end_date:        str
    days:            int
    reason:          str = ""

class LeaveRequestOut(ModelSchema):
    class Meta:
        model  = LeaveRequest
        fields = ["id", "start_date", "end_date", "days", "status", "created_at"]

@router.get("/leave-requests", response=list[LeaveRequestOut])
def list_leave_requests(request, professional_id: str = "", status: str = ""):
    qs = LeaveRequest.objects.all()
    if professional_id:
        qs = qs.filter(professional_id=professional_id)
    if status:
        qs = qs.filter(status=status)
    return list(qs[:200])

@router.post("/leave-requests", response=LeaveRequestOut)
def create_leave_request(request, payload: LeaveRequestIn):
    return LeaveRequest.objects.create(**payload.dict(), status="submitted")

@router.post("/leave-requests/{req_id}/approve")
def approve_leave(request, req_id: str):
    req = get_object_or_404(LeaveRequest, id=req_id)
    req.status      = "approved"
    req.approved_by = request.user if request.user.is_authenticated else None
    req.save(update_fields=["status", "approved_by"])
    return {"status": "approved"}

@router.post("/leave-requests/{req_id}/reject")
def reject_leave(request, req_id: str):
    req = get_object_or_404(LeaveRequest, id=req_id)
    req.status = "rejected"
    req.save(update_fields=["status"])
    return {"status": "rejected"}


# ── Performance Reviews ───────────────────────────────────────────────────────

class ReviewIn(Schema):
    professional_id: str
    period_start:    str
    period_end:      str
    kpi_score:       float = 0
    overall_score:   float = 0
    comments:        str = ""
    goals_next:      str = ""

class ReviewOut(ModelSchema):
    class Meta:
        model  = PerformanceReview
        fields = ["id", "period_start", "period_end", "overall_score", "status"]

@router.get("/performance-reviews", response=list[ReviewOut])
def list_reviews(request, professional_id: str):
    return list(PerformanceReview.objects.filter(professional_id=professional_id))

@router.post("/performance-reviews", response=ReviewOut)
def create_review(request, payload: ReviewIn):
    return PerformanceReview.objects.create(
        **payload.dict(),
        reviewer=request.user if request.user.is_authenticated else None
    )


# ── Training Records ──────────────────────────────────────────────────────────

class TrainingIn(Schema):
    professional_id:  str
    training_name:    str
    category:         str
    provider:         str = ""
    completed_date:   str
    expiry_date:      Optional[str] = None
    certificate_ref:  str = ""
    cpd_hours:        float = 0

class TrainingOut(ModelSchema):
    class Meta:
        model  = TrainingRecord
        fields = ["id", "training_name", "category", "completed_date", "expiry_date", "cpd_hours"]

@router.get("/training", response=list[TrainingOut])
def list_training(request, professional_id: str):
    return list(TrainingRecord.objects.filter(professional_id=professional_id).order_by("-completed_date"))

@router.post("/training", response=TrainingOut)
def add_training(request, payload: TrainingIn):
    return TrainingRecord.objects.create(**payload.dict())
