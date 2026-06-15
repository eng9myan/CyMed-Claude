import uuid6
from django.db import models
from django.conf import settings

def generate_uuidv7():
    return uuid6.uuid7()

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True, help_text="Generic reference to auth_app.Facility")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hr_departments'

class Designation(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hr_designations'

class HealthcareProfessional(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True)
    employee_id = models.CharField(max_length=100, unique=True)
    joining_date = models.DateField(null=True, blank=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hr_healthcare_professionals'

class Shift(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hr_shifts'

class DutyRoster(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    professional = models.ForeignKey(HealthcareProfessional, on_delete=models.CASCADE)
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    roster_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hr_duty_rosters'

class Attendance(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    professional = models.ForeignKey(HealthcareProfessional, on_delete=models.CASCADE)
    date = models.DateField()
    clock_in = models.TimeField(null=True, blank=True)
    clock_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Present')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hr_attendances'


# ── Leave Management ───────────────────────────────────────────────────────────

class LeaveType(models.Model):
    id             = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name           = models.CharField(max_length=100)
    code           = models.CharField(max_length=20, unique=True)
    annual_days    = models.IntegerField(default=0)
    is_paid        = models.BooleanField(default=True)
    requires_doc   = models.BooleanField(default=False, help_text="Medical certificate required")
    carry_forward  = models.BooleanField(default=False)
    max_carry_days = models.IntegerField(default=0)

    class Meta:
        db_table = 'hr_leave_types'


class LeaveRequest(models.Model):
    LEAVE_STATUS = [
        ("draft",    "Draft"),
        ("submitted","Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled","Cancelled"),
    ]
    id           = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    professional = models.ForeignKey(HealthcareProfessional, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type   = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date   = models.DateField()
    end_date     = models.DateField()
    days         = models.IntegerField()
    reason       = models.TextField(blank=True)
    status       = models.CharField(max_length=15, choices=LEAVE_STATUS, default='draft')
    approved_by  = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    document     = models.CharField(max_length=500, blank=True, help_text="File path to supporting document")
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hr_leave_requests'


# ── Performance & Training ─────────────────────────────────────────────────────

class PerformanceReview(models.Model):
    id           = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    professional = models.ForeignKey(HealthcareProfessional, on_delete=models.CASCADE, related_name='reviews')
    reviewer     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    period_start = models.DateField()
    period_end   = models.DateField()
    kpi_score    = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    comments     = models.TextField(blank=True)
    goals_next   = models.TextField(blank=True)
    status       = models.CharField(max_length=20, default='draft')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hr_performance_reviews'


class TrainingRecord(models.Model):
    id           = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    professional = models.ForeignKey(HealthcareProfessional, on_delete=models.CASCADE, related_name='trainings')
    training_name = models.CharField(max_length=255)
    category     = models.CharField(max_length=100, help_text="BLS|ACLS|Infection Control|Fire Safety|Other")
    provider     = models.CharField(max_length=255, blank=True)
    completed_date = models.DateField()
    expiry_date  = models.DateField(null=True, blank=True)
    certificate_ref = models.CharField(max_length=255, blank=True)
    cpd_hours    = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    class Meta:
        db_table = 'hr_training_records'
