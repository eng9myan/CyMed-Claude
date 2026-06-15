from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services import MultiProviderAIGateway
import json

@csrf_exempt
def generate_insight(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            context_data = data.get('context', {})
            intent = data.get('intent', 'GENERAL_ASSISTANCE')
            
            gateway = MultiProviderAIGateway()
            result = gateway.generate_clinical_insight(context_data, intent)
            return JsonResponse(result)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "POST required"}, status=405)
