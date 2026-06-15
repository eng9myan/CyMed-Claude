from django.db import transaction
from django.utils import timezone
from .models import Admission
from bed_app.models import Bed, BedAssignment
import uuid

@transaction.atomic
def admit_patient(patient_id, provider_id, bed_id=None):
    admission = Admission.objects.create(
        patient_id=patient_id,
        admitting_provider_id=provider_id,
        state='admitted',
        admission_time=timezone.now()
    )
    
    if bed_id:
        bed = Bed.objects.get(id=bed_id)
        admission.bed = bed
        admission.save()
        
        bed.status = 'OCCUPIED'
        bed.save()
        
        BedAssignment.objects.create(
            bed=bed,
            patient_id=patient_id,
            encounter_id=uuid.uuid4(), # Mock encounter if none exists
            assigned_by=provider_id
        )
        
    return admission

@transaction.atomic
def discharge_patient(admission_id):
    admission = Admission.objects.get(id=admission_id)
    admission.state = 'discharged'
    admission.discharge_time = timezone.now()
    
    if admission.bed:
        bed = admission.bed
        bed.status = 'CLEANING'
        bed.save()
        
        # Close bed assignment
        assignment = BedAssignment.objects.filter(bed=bed, released_at__isnull=True).first()
        if assignment:
            assignment.released_at = timezone.now()
            assignment.save()
            
        admission.bed = None
        
    admission.save()
    return admission

@transaction.atomic
def transfer_patient(admission_id, new_bed_id, provider_id):
    admission = Admission.objects.get(id=admission_id)
    
    if admission.bed:
        old_bed = admission.bed
        old_bed.status = 'CLEANING'
        old_bed.save()
        
        assignment = BedAssignment.objects.filter(bed=old_bed, released_at__isnull=True).first()
        if assignment:
            assignment.released_at = timezone.now()
            assignment.save()
            
    new_bed = Bed.objects.get(id=new_bed_id)
    new_bed.status = 'OCCUPIED'
    new_bed.save()
    
    admission.bed = new_bed
    admission.save()
    
    BedAssignment.objects.create(
        bed=new_bed,
        patient_id=admission.patient_id,
        encounter_id=uuid.uuid4(),
        assigned_by=provider_id
    )
    
    return admission
