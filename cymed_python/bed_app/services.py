from django.db import transaction
from django.utils import timezone
from .models import Bed, BedAssignment
import uuid

@transaction.atomic
def assign_bed(bed_id, patient_id, encounter_id, provider_id):
    bed = Bed.objects.get(id=bed_id)
    if bed.status != 'AVAILABLE':
        raise ValueError(f"Bed {bed_id} is not available (Status: {bed.status})")
        
    bed.status = 'OCCUPIED'
    bed.save()
    
    assignment = BedAssignment.objects.create(
        bed=bed,
        patient_id=patient_id,
        encounter_id=encounter_id,
        assigned_by=provider_id
    )
    return assignment

@transaction.atomic
def clean_bed(bed_id):
    bed = Bed.objects.get(id=bed_id)
    if bed.status != 'CLEANING':
        raise ValueError(f"Bed {bed_id} is not awaiting cleaning (Status: {bed.status})")
        
    bed.status = 'AVAILABLE'
    bed.save()
    return bed

@transaction.atomic
def set_bed_maintenance(bed_id):
    bed = Bed.objects.get(id=bed_id)
    bed.status = 'MAINTENANCE'
    bed.save()
    return bed

def get_available_beds(ward_id=None):
    queryset = Bed.objects.filter(status='AVAILABLE', is_active=True)
    if ward_id:
        queryset = queryset.filter(ward_id=ward_id)
    return queryset

class BedAllocationError(Exception):
    pass

class BedAllocationService:
    @staticmethod
    @transaction.atomic
    def allocate_bed(encounter_id, patient_id, bed_id, requested_by):
        bed = Bed.objects.select_for_update().get(id=bed_id)
        if bed.status != 'AVAILABLE':
            raise BedAllocationError(f"Bed {bed_id} is not available (Status: {bed.status})")
            
        bed.status = 'OCCUPIED'
        bed.save()
        
        assignment = BedAssignment.objects.create(
            bed=bed,
            patient_id=patient_id,
            encounter_id=encounter_id,
            assigned_by=requested_by
        )
        return assignment

    @staticmethod
    @transaction.atomic
    def release_bed(encounter_id):
        try:
            assignment = BedAssignment.objects.get(encounter_id=encounter_id, released_at__isnull=True)
            assignment.released_at = timezone.now()
            assignment.save()
            
            bed = assignment.bed
            bed.status = 'CLEANING'
            bed.save()
            return True
        except BedAssignment.DoesNotExist:
            return False
