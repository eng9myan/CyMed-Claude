import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class TerminologySystem(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=100, unique=True) # e.g., 'ICD-11', 'SNOMED-CT', 'LOINC', 'RxNorm'
    version = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'terminology_systems'

class ClinicalConcept(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    system = models.ForeignKey(TerminologySystem, on_delete=models.CASCADE, related_name='concepts')
    code = models.CharField(max_length=100)
    display_name = models.CharField(max_length=500)
    uri = models.URLField(max_length=500, null=True, blank=True) # Used for ICD-11 WHO Foundation URI
    parent_uri = models.URLField(max_length=500, null=True, blank=True) # Ontological hierarchy
    definition = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clinical_concepts'
        unique_together = ('system', 'code')
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['display_name']),
        ]

class ConceptMapping(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    source_concept = models.ForeignKey(ClinicalConcept, on_delete=models.CASCADE, related_name='mappings_from')
    target_concept = models.ForeignKey(ClinicalConcept, on_delete=models.CASCADE, related_name='mappings_to')
    mapping_type = models.CharField(max_length=50) # exact, equivalent, broader, narrower
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'concept_mappings'
        unique_together = ('source_concept', 'target_concept', 'mapping_type')
