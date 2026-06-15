import uuid6
import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from patient_app.models import GlobalPatient, Patient, Encounter

class Command(BaseCommand):
    help = 'Seeds the database with synthetic healthcare data for verification'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))

        # Seed 20 Patients
        patients = []
        for i in range(20):
            global_patient = GlobalPatient.objects.create(
                global_patient_id=f"CYMED-100{i:03d}",
                national_id=f"NID-{random.randint(1000000, 9999999)}",
                master_demographics={
                    "first_name": f"TestUser{i}",
                    "last_name": f"Smith{i}",
                    "dob": (datetime.now() - timedelta(days=random.randint(5000, 25000))).strftime("%Y-%m-%d"),
                    "gender": random.choice(["MALE", "FEMALE"])
                }
            )
            patient = Patient.objects.create(global_patient=global_patient)
            patients.append(patient)
            
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(patients)} patients.'))

        # Seed Encounters
        for patient in patients:
            if random.random() > 0.3: # 70% chance of having an active encounter
                Encounter.objects.create(
                    patient_id=patient.id,
                    facility_id=uuid6.uuid7(), # Mock facility
                    encounter_type=random.choice(["INPATIENT", "OUTPATIENT", "EMERGENCY"]),
                    status=random.choice(["ADMITTED", "DISCHARGED"])
                )
                
        self.stdout.write(self.style.SUCCESS('Successfully seeded encounters.'))
        self.stdout.write(self.style.SUCCESS('Data seeding complete!'))
