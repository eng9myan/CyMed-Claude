import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from ai_platform.models import AiProvider

AiProvider.objects.update_or_create(
    name="openai",
    defaults={
        "api_key_secret_name": "dummy_key",
        "base_url": "https://api.openai.com",
        "is_active": True
    }
)

AiProvider.objects.update_or_create(
    name="local",
    defaults={
        "api_key_secret_name": "",
        "base_url": "http://localhost:11434",
        "is_active": True
    }
)

print("AI Providers Seeded")
