from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Seeds the database with base RBAC users for testing.'

    def handle(self, *args, **options):
        User = get_user_model()
        users = [
            {'email': 'admin@cymed.com', 'username': 'admin', 'role': 'admin'},
            {'email': 'doctor@cymed.com', 'username': 'doctor', 'role': 'doctor'},
            {'email': 'lab@cymed.com', 'username': 'lab', 'role': 'pathologist'},
            {'email': 'staff@cymed.com', 'username': 'staff', 'role': 'nurse'},
        ]

        for u_data in users:
            email = u_data['email']
            if not User.objects.filter(email=email).exists():
                # For custom user models, we might just need email and password.
                user = User.objects.create_user(
                    email=email,
                    username=u_data['username'],
                    password='password123'
                )
                self.stdout.write(self.style.SUCCESS(f"Created user {email}"))
            else:
                self.stdout.write(self.style.WARNING(f"User {email} already exists"))
        
        self.stdout.write(self.style.SUCCESS("Successfully seeded RBAC users."))
