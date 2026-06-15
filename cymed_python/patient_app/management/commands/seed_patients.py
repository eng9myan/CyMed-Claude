from django.core.management.base import BaseCommand
from patient_app.models import GlobalPatient
from faker import Faker
import uuid
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Seeds the database with massive synthetic staging data using Faker'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=100, help='Number of patients to generate')

    def handle(self, *args, **options):
        count = options['count']
        fake = Faker()
        
        self.stdout.write(self.style.SUCCESS(f"Starting seed for {count} synthetic patients..."))
        
        patients_to_create = []
        for _ in range(count):
            global_id = f"CYMED-{str(uuid.uuid4().hex)[:8].upper()}"
            nat_id = fake.ssn()
            demographics = {
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "date_of_birth": fake.date_of_birth(minimum_age=0, maximum_age=105).isoformat(),
                "gender": fake.random_element(elements=('M', 'F', 'O')),
                "primary_phone": fake.phone_number(),
                "email": fake.email()
            }
            patients_to_create.append(
                GlobalPatient(
                    global_patient_id=global_id,
                    national_id=nat_id,
                    master_demographics=demographics,
                    identity_confidence_score=1.0,
                    is_active=True
                )
            )
            
        GlobalPatient.objects.bulk_create(patients_to_create, batch_size=1000)
        
        self.stdout.write(self.style.SUCCESS(f"Successfully generated {count} synthetic patients!"))
