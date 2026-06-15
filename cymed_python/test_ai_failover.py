import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from ai_platform.services import MultiProviderAIGateway
from ai_platform.models import AiProvider

def run_test():
    print("--- STARTING AI FAILOVER TEST ---")
    
    # 1. Provision Providers with DUMMY keys to force failure
    AiProvider.objects.get_or_create(name="openai", defaults={"api_key_secret_name": "OPENAI_API_KEY", "is_active": True})
    AiProvider.objects.get_or_create(name="gemini", defaults={"api_key_secret_name": "GEMINI_API_KEY", "is_active": True})
    AiProvider.objects.get_or_create(name="local", defaults={"api_key_secret_name": "LOCAL_API_KEY", "is_active": True})
    
    gateway = MultiProviderAIGateway()
    
    # 2. Execute Prompt
    context = {"patient_age": 45, "symptoms": ["headache", "fever"]}
    intent = "CLINICAL_SUMMARY"
    
    print("\nExecuting Prompt:", context)
    try:
        result = gateway.generate_clinical_insight(context, intent)
        print("\n--- FINAL RESULT ---")
        print(result)
    except Exception as e:
        print("Test Failed:", e)

if __name__ == "__main__":
    run_test()
