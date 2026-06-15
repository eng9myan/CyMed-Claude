from typing import List, Optional
from .models import ClinicalConcept, TerminologySystem

class TerminologyService:
    """
    Core service for querying standardized medical vocabularies (SNOMED-CT, LOINC, ICD-10, ICD-11)
    """
    
    @classmethod
    def search_concept(cls, query: str, code_system: str = None) -> List[dict]:
        """
        Searches for a medical concept using text matching.
        """
        qs = ClinicalConcept.objects.filter(is_active=True)
        if code_system:
            qs = qs.filter(system__name=code_system)
            
        # Basic text search (In production, replace with ElasticSearch or pg_trgm)
        qs = qs.filter(display_name__icontains=query)[:50]
        
        return [
            {
                "code": c.code,
                "display": c.display_name,
                "system": c.system.name,
                "version": c.system.version
            } for c in qs
        ]

    @classmethod
    def validate_code(cls, code: str, code_system: str) -> bool:
        """
        Validates if a given code exists in the active terminology dataset.
        """
        return ClinicalConcept.objects.filter(code=code, system__name=code_system, is_active=True).exists()

    @classmethod
    def get_concept_details(cls, system_name: str, code: str) -> Optional[dict]:
        try:
            concept = ClinicalConcept.objects.get(system__name=system_name, code=code)
            return {
                "id": str(concept.id),
                "code": concept.code,
                "display_name": concept.display_name,
                "definition": concept.definition,
                "uri": concept.uri
            }
        except ClinicalConcept.DoesNotExist:
            return None

    @classmethod
    def search_icd11(cls, query: str) -> list:
        # Mock WHO ICD-11 API Response
        query = query.lower()
        mock_database = [
            {"code": "2C70", "display_name": "Malignant neoplasm of breast", "uri": "http://id.who.int/icd/entity/141870562", "icd10_crosswalk": "C50"},
            {"code": "5A11", "display_name": "Type 2 diabetes mellitus", "uri": "http://id.who.int/icd/entity/745548766", "icd10_crosswalk": "E11"},
            {"code": "1A40", "display_name": "Malaria", "uri": "http://id.who.int/icd/entity/1429815039", "icd10_crosswalk": "B54"},
            {"code": "NA01", "display_name": "Fracture of skull or facial bones", "uri": "http://id.who.int/icd/entity/1649298453", "icd10_crosswalk": "S02"},
            {"code": "9B71", "display_name": "Glaucoma", "uri": "http://id.who.int/icd/entity/1013725841", "icd10_crosswalk": "H40"},
        ]
        
        results = [m for m in mock_database if query in m['display_name'].lower() or query in m['code'].lower()]
        return results
