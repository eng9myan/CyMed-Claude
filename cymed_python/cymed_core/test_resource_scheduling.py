import pytest
from datetime import datetime, date, time, timedelta
from django.utils import timezone
from auth_app.models import CustomUser, Facility

@pytest.fixture
def setup_resources():
    # Setup Tenancy
    from auth_app.models import Organization
    org = Organization.objects.create(name="Cymed Org", type="Hospital")
    facility = Facility.objects.create(organization=org, name="Resource Hosp", type="Main Campus")
    user = CustomUser.objects.create(username="admin_res", role="SYSTEM_ADMIN")
    
    # 1. Setup Bed Management
    from bed_app.models import Ward, Bed
    ward = Ward.objects.create(facility_id=facility.id, name="ICU", specialty="Critical Care", ward_type="ICU")
    bed1 = Bed.objects.create(ward=ward, bed_number="ICU-01", status="AVAILABLE", equipment_level="VENTILATOR")
    bed2 = Bed.objects.create(ward=ward, bed_number="ICU-02", status="OCCUPIED", equipment_level="BASIC")

    # 2. Setup HR Management
    from hr_app.models import Department, Designation, HealthcareProfessional, Shift
    dept = Department.objects.create(facility_id=facility.id, name="Surgery")
    desig = Designation.objects.create(department=dept, name="Surgeon")
    dr_user = CustomUser.objects.create(username="dr_surgeon", role="DOCTOR")
    doc1 = HealthcareProfessional.objects.create(
        user=dr_user, department=dept, designation=desig, employee_id="DOC-001"
    )
    shift_day = Shift.objects.create(name="Day", start_time=time(8, 0), end_time=time(16, 0))
    shift_night = Shift.objects.create(name="Night", start_time=time(20, 0), end_time=time(8, 0))
    
    # 3. Setup OR Management
    # Normally ot_room is from scheduling_app, but we use a UUID for now
    import uuid
    ot_room_id = uuid.uuid4()
    
    return {
        "facility": facility,
        "user": user,
        "ward": ward,
        "bed1": bed1,
        "bed2": bed2,
        "doc1": doc1,
        "shift_day": shift_day,
        "shift_night": shift_night,
        "ot_room_id": ot_room_id
    }

@pytest.mark.django_db
def test_bed_allocation_constraints(setup_resources):
    from bed_app.services import BedAllocationService, BedAllocationError
    import uuid
    
    encounter_id = uuid.uuid4()
    patient_id = uuid.uuid4()
    user_id = setup_resources["user"].id
    
    # Successful allocation
    assignment = BedAllocationService.allocate_bed(
        encounter_id=encounter_id,
        patient_id=patient_id,
        bed_id=setup_resources["bed1"].id,
        requested_by=user_id
    )
    assert assignment.id is not None
    
    # Refresh bed status
    setup_resources["bed1"].refresh_from_db()
    assert setup_resources["bed1"].status == "OCCUPIED"
    
    # Failed allocation (already occupied)
    with pytest.raises(BedAllocationError) as exc:
        BedAllocationService.allocate_bed(
            encounter_id=uuid.uuid4(),
            patient_id=uuid.uuid4(),
            bed_id=setup_resources["bed2"].id, # ICU-02 was occupied
            requested_by=user_id
        )
    assert "not available" in str(exc.value)

@pytest.mark.django_db
def test_shift_scheduling_constraints(setup_resources):
    from hr_app.services import ShiftSchedulingService, ShiftSchedulingError
    
    doc_id = setup_resources["doc1"].id
    shift_day_id = setup_resources["shift_day"].id
    shift_night_id = setup_resources["shift_night"].id
    
    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    # 1. Assign Day Shift Today
    roster = ShiftSchedulingService.assign_shift(doc_id, shift_day_id, today)
    assert roster.id is not None
    
    # 2. Prevent Overlap (Same day)
    with pytest.raises(ShiftSchedulingError) as exc:
        ShiftSchedulingService.assign_shift(doc_id, shift_night_id, today)
    assert "already scheduled" in str(exc.value)
    
    # 3. Prevent inadequate rest (e.g., Night shift ending at 8AM tomorrow, and Day shift tomorrow at 8AM)
    # Night shift starts today
    ShiftSchedulingService.assign_shift(doc_id, shift_night_id, tomorrow)
    
    # Now try to assign day shift the day after tomorrow
    day_after = tomorrow + timedelta(days=1)
    with pytest.raises(ShiftSchedulingError) as exc:
        ShiftSchedulingService.assign_shift(doc_id, shift_day_id, day_after)
    assert "Minimum rest period" in str(exc.value)

@pytest.mark.django_db
def test_or_booking_constraints(setup_resources):
    from or_app.services import ORBookingService, ORBookingError
    import uuid
    
    surgeon_id = setup_resources["doc1"].id
    ot_room_id = setup_resources["ot_room_id"]
    encounter_id = uuid.uuid4()
    patient_id = uuid.uuid4()
    procedure_code = uuid.uuid4()
    
    now = timezone.now()
    start_time = now + timedelta(hours=1)
    end_time = now + timedelta(hours=3)
    
    # 1. Successful booking
    booking1 = ORBookingService.schedule_surgery(
        encounter_id=encounter_id,
        patient_id=patient_id,
        procedure_code=procedure_code,
        procedure_name="Appendectomy",
        surgeon_id=surgeon_id,
        ot_room_id=ot_room_id,
        start_time=start_time,
        end_time=end_time
    )
    assert booking1.id is not None
    
    # 2. Prevent Double Booking (Same Room)
    with pytest.raises(ORBookingError) as exc:
        ORBookingService.schedule_surgery(
            encounter_id=uuid.uuid4(),
            patient_id=uuid.uuid4(),
            procedure_code=procedure_code,
            procedure_name="Hernia Repair",
            surgeon_id=uuid.uuid4(), # Different surgeon
            ot_room_id=ot_room_id, # Same room
            start_time=start_time + timedelta(hours=1),
            end_time=end_time + timedelta(hours=1)
        )
    assert "already booked" in str(exc.value)
    
    # 3. Prevent Double Booking (Same Surgeon, different room)
    other_ot_room = uuid.uuid4()
    with pytest.raises(ORBookingError) as exc:
        ORBookingService.schedule_surgery(
            encounter_id=uuid.uuid4(),
            patient_id=uuid.uuid4(),
            procedure_code=procedure_code,
            procedure_name="Hernia Repair",
            surgeon_id=surgeon_id, # Same surgeon
            ot_room_id=other_ot_room,
            start_time=start_time + timedelta(hours=1),
            end_time=end_time + timedelta(hours=1)
        )
    assert "already booked for another surgery" in str(exc.value)

@pytest.mark.django_db
def test_discharge_releases_bed(setup_resources):
    from bed_app.services import BedAllocationService
    from bed_app.models import BedAssignment
    from cymed_core.events import patient_discharged
    import uuid
    
    encounter_id = uuid.uuid4()
    
    BedAllocationService.allocate_bed(
        encounter_id=encounter_id,
        patient_id=uuid.uuid4(),
        bed_id=setup_resources["bed1"].id,
        requested_by=setup_resources["user"].id
    )
    
    # Fire the event
    patient_discharged.send(sender=None, encounter_id=encounter_id)
    
    # Bed should now be in CLEANING status, and assignment released
    setup_resources["bed1"].refresh_from_db()
    assert setup_resources["bed1"].status == "CLEANING"
    
    assignment = BedAssignment.objects.get(encounter_id=encounter_id)
    assert assignment.released_at is not None
