from django.db import transaction
from django.db.models import Q
from .models import OtCase

class ORBookingError(Exception):
    pass

class ORBookingService:
    @staticmethod
    @transaction.atomic
    def schedule_surgery(encounter_id, patient_id, procedure_code, procedure_name, surgeon_id, ot_room_id, start_time, end_time):
        if start_time >= end_time:
            raise ORBookingError("Start time must be before end time.")

        # Check for room double booking
        overlapping_room = OtCase.objects.filter(
            ot_room_id=ot_room_id,
            status__in=['SCHEDULED', 'PRE_OP', 'INTRA_OP'],
            scheduled_start__lt=end_time,
            scheduled_end__gt=start_time
        ).exists()

        if overlapping_room:
            raise ORBookingError("The selected OR is already booked for this time period.")

        # Check for surgeon double booking
        overlapping_surgeon = OtCase.objects.filter(
            surgeon_id=surgeon_id,
            status__in=['SCHEDULED', 'PRE_OP', 'INTRA_OP'],
            scheduled_start__lt=end_time,
            scheduled_end__gt=start_time
        ).exists()

        if overlapping_surgeon:
            raise ORBookingError("The surgeon is already booked for another surgery during this time period.")

        booking = OtCase.objects.create(
            encounter_id=encounter_id,
            patient_id=patient_id,
            surgeon_id=surgeon_id,
            procedure_code=procedure_code,
            planned_procedure_name=procedure_name,
            ot_room_id=ot_room_id,
            status="SCHEDULED",
            scheduled_start=start_time,
            scheduled_end=end_time
        )
        
        return booking

    @staticmethod
    @transaction.atomic
    def reschedule_surgery(booking_id, new_start_time, new_end_time):
        if new_start_time >= new_end_time:
            raise ORBookingError("Start time must be before end time.")

        booking = OtCase.objects.select_for_update().get(id=booking_id)
        
        if booking.status not in ['SCHEDULED', 'PRE_OP']:
            raise ORBookingError(f"Cannot reschedule surgery in {booking.status} status.")

        # Check for room double booking (excluding this booking)
        overlapping_room = OtCase.objects.filter(
            ~Q(id=booking_id),
            ot_room_id=booking.ot_room_id,
            status__in=['SCHEDULED', 'PRE_OP', 'INTRA_OP'],
            scheduled_start__lt=new_end_time,
            scheduled_end__gt=new_start_time
        ).exists()

        if overlapping_room:
            raise ORBookingError("The OR is already booked for this new time period.")

        # Check for surgeon double booking (excluding this booking)
        overlapping_surgeon = OtCase.objects.filter(
            ~Q(id=booking_id),
            surgeon_id=booking.surgeon_id,
            status__in=['SCHEDULED', 'PRE_OP', 'INTRA_OP'],
            scheduled_start__lt=new_end_time,
            scheduled_end__gt=new_start_time
        ).exists()

        if overlapping_surgeon:
            raise ORBookingError("The surgeon is already booked for this new time period.")

        booking.scheduled_start = new_start_time
        booking.scheduled_end = new_end_time
        booking.save(update_fields=['scheduled_start', 'scheduled_end'])
        return booking

    @staticmethod
    def cancel_surgery(booking_id, reason):
        booking = OtCase.objects.get(id=booking_id)
        if booking.status not in ['SCHEDULED', 'PRE_OP']:
            raise ORBookingError(f"Cannot cancel surgery in {booking.status} status.")
            
        booking.status = 'CANCELLED'
        # Would normally save the reason in a note or audit log
        booking.save(update_fields=['status'])
        return booking
