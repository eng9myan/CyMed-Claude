import uuid6
import random
from django.core.management.base import BaseCommand
from faker import Faker
from patient_app.models import GlobalPatient, Patient, Encounter
from auth_app.models import CustomUser

class Command(BaseCommand):
    help = 'Seeds the database with massive amounts of realistic synthetic data for Enterprise Demo'

    def handle(self, *args, **kwargs):
        fake = Faker()
        self.stdout.write("Seeding CyMed Enterprise Database...")
        
        # 1. Create a dummy facility and doctor
        doctor, _ = CustomUser.objects.get_or_create(
            username='doctor_demo',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Smith',
                'role': 'DOCTOR',
                'email': 'doctor@cymed.com'
            }
        )
        facility_id = uuid6.uuid7()
        
        # 2. Generate 100 Synthetic Patients
        self.stdout.write("Generating 100 synthetic patients...")
        patients_to_create = []
        global_patients = []
        
        for _ in range(100):
            gp = GlobalPatient(
                id=uuid6.uuid7(),
                global_patient_id=fake.uuid4(),
                national_id=fake.ssn(),
                master_demographics={
                    "first_name": fake.first_name(),
                    "last_name": fake.last_name(),
                    "dob": str(fake.date_of_birth(minimum_age=18, maximum_age=90)),
                    "gender": random.choice(["Male", "Female", "Other"]),
                    "phone": fake.phone_number(),
                    "address": fake.address()
                }
            )
            global_patients.append(gp)
        
        GlobalPatient.objects.bulk_create(global_patients)
        
        for gp in global_patients:
            p = Patient(
                id=uuid6.uuid7(),
                global_patient=gp,
                primary_care_physician_id=doctor.id,
                blood_type=random.choice(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
            )
            patients_to_create.append(p)
            
        Patient.objects.bulk_create(patients_to_create)
        
        # 3. Generate 50 Encounters
        self.stdout.write("Generating 50 active encounters...")
        encounters = []
        sampled_patients = random.sample(patients_to_create, 50)
        
        for p in sampled_patients:
            e = Encounter(
                id=uuid6.uuid7(),
                patient=p,
                facility_id=facility_id,
                encounter_type=random.choice(["INPATIENT", "OUTPATIENT", "EMERGENCY"]),
                status=random.choice(["TRIAGED", "IN_PROGRESS", "ADMITTED"]),
                attending_physician_id=doctor.id
            )
            encounters.append(e)
            
        Encounter.objects.bulk_create(encounters)
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded the database!'))
