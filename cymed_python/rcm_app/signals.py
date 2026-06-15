from django.dispatch import receiver
from django.db.models.signals import post_save
from admission_app.models import Admission
from rcm_app.models import InsuranceClaim

@receiver(post_save, sender=Admission)
def handle_admission_discharge(sender, instance, created, **kwargs):
    if instance.state == 'discharged':
        print(f"RCM Engine: Detected Discharge for Admission {instance.id}. Generating Claim...")
        
        # In a real scenario, we would link this to an Encounter ID
        # Since Admission acts as our encounter here, we use its ID
        claim, created = InsuranceClaim.objects.get_or_create(
            encounter_id=instance.id,
            patient_id=instance.patient.id,
            defaults={'state': 'DRAFT', 'total_amount': 0.00}
        )
        
        if created:
            print(f"RCM Engine: Successfully generated DRAFT Claim {claim.id} for Patient {claim.patient_id}")
        else:
            print(f"RCM Engine: Claim already exists for this encounter.")
