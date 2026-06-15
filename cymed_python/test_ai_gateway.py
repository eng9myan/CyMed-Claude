import os
import django
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

client = Client()
response = client.post('/api/v1/ai/generate/', 
                       data={"context": {"age": 45, "symptoms": "headache"}, "intent": "GENERAL_ASSISTANCE"}, 
                       content_type='application/json')
print("Status:", response.status_code)
print("Data:", response.json())
