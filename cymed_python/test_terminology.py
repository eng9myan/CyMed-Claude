import os
import django
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

client = Client()
response = client.get('/api/v1/terminology/search/?q=Cholera')
print("Status:", response.status_code)
print("Data:", response.json())
