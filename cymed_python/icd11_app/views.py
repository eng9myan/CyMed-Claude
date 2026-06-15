from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from . import services


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def icd11_search(request):
    q          = request.query_params.get("q", "")
    max_res    = min(int(request.query_params.get("limit", 20)), 50)
    if not q or len(q) < 2:
        return Response({"results": []})
    results = services.search(q, max_results=max_res)
    return Response({"results": results, "count": len(results)})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def icd11_code_detail(request, code: str):
    data = services.get_code(code)
    if data is None:
        return Response({"error": f"ICD-11 code '{code}' not found"}, status=404)
    return Response(data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def icd10_map(request, icd10: str):
    mapped = services.icd10_to_icd11(icd10)
    return Response({"icd10": icd10, "icd11_codes": mapped})
