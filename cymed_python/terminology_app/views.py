from django.http import JsonResponse
from .models import ClinicalConcept

def search_concepts(request):
    query = request.GET.get('q', '')
    if query:
        concepts = ClinicalConcept.objects.filter(display_name__icontains=query) | ClinicalConcept.objects.filter(code__icontains=query)
        concepts = concepts[:20]
    else:
        concepts = ClinicalConcept.objects.all()[:20]
        
    data = [
        {
            "id": str(c.id),
            "code": c.code,
            "display_name": c.display_name,
            "system": c.system.name
        } for c in concepts
    ]
    return JsonResponse({"results": data})

# Create your views here.
