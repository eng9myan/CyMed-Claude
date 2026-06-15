from django.db import transaction
from django.db.models import Q
from datetime import timedelta, datetime
from .models import HealthcareProfessional, Shift, DutyRoster

class ShiftSchedulingError(Exception):
    pass

class ShiftSchedulingService:
    @staticmethod
    @transaction.atomic
    def assign_shift(professional_id, shift_id, roster_date):
        professional = HealthcareProfessional.objects.get(id=professional_id)
        shift = Shift.objects.get(id=shift_id)

        # 1. Check for overlapping shift on the same date
        existing_roster = DutyRoster.objects.filter(
            professional=professional,
            roster_date=roster_date
        ).first()

        if existing_roster:
            raise ShiftSchedulingError(f"Professional is already scheduled for a shift on {roster_date}.")

        # 2. Enforce minimum rest period (e.g., 8 hours)
        # Check previous day's shift
        prev_date = roster_date - timedelta(days=1)
        prev_roster = DutyRoster.objects.filter(
            professional=professional,
            roster_date=prev_date
        ).first()

        if prev_roster:
            # Simple assumption: shifts on the same day are handled by overlap check
            # Cross-day rest check
            # For simplicity, if prev shift ends late, and new shift starts early
            # In a real app we'd construct full datetimes
            prev_end = datetime.combine(prev_date, prev_roster.shift.end_time)
            if prev_roster.shift.end_time < prev_roster.shift.start_time:
                # Crossed midnight
                prev_end += timedelta(days=1)
                
            curr_start = datetime.combine(roster_date, shift.start_time)
            
            rest_duration = (curr_start - prev_end).total_seconds() / 3600
            
            if rest_duration < 8.0:
                raise ShiftSchedulingError(f"Minimum rest period of 8 hours not met. Rest is only {rest_duration:.1f} hours.")

        roster = DutyRoster.objects.create(
            professional=professional,
            shift=shift,
            roster_date=roster_date
        )
        
        return roster

    @staticmethod
    def get_staff_on_duty(department_id, current_datetime=None):
        if not current_datetime:
            current_datetime = datetime.now()
            
        current_date = current_datetime.date()
        current_time = current_datetime.time()
        
        # Get rosters for today where shift covers current time
        # Handling overnight shifts (start > end)
        rosters = DutyRoster.objects.filter(
            professional__department_id=department_id,
            roster_date=current_date
        )
        
        on_duty = []
        for roster in rosters:
            s = roster.shift
            if s.start_time <= s.end_time:
                if s.start_time <= current_time <= s.end_time:
                    on_duty.append(roster.professional)
            else:
                # Overnight shift, e.g., 20:00 to 08:00
                if current_time >= s.start_time or current_time <= s.end_time:
                    on_duty.append(roster.professional)
                    
        # Also check rosters from yesterday for overnight shifts
        yesterday = current_date - timedelta(days=1)
        yesterday_rosters = DutyRoster.objects.filter(
            professional__department_id=department_id,
            roster_date=yesterday
        )
        
        for roster in yesterday_rosters:
            s = roster.shift
            if s.start_time > s.end_time:
                # Started yesterday, ends today
                if current_time <= s.end_time:
                    on_duty.append(roster.professional)

        return on_duty
