from ninja import Router
from typing import List
from ninja import Schema
from .services import TerminologyService

router = Router(tags=["Terminology"])

class ICD11SearchResponse(Schema):
    code: str
    display_name: str
    uri: str
    icd10_crosswalk: str

@router.get("/search/icd11", response=List[ICD11SearchResponse])
def search_icd11(request, q: str):
    """
    Mock endpoint simulating the WHO ICD-11 Foundation API search.
    """
    results = TerminologyService.search_icd11(q)
    return results
