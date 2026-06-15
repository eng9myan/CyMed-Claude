from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GlobalPatientViewSet, FacilityMRNViewSet, ExternalIdentifierViewSet, PatientMergeLogViewSet, PatientViewSet, EncounterViewSet, ClinicalNoteViewSet, ConditionViewSet, AllergyViewSet

router = DefaultRouter()
router.register(r'globalpatients', GlobalPatientViewSet)
router.register(r'facilitymrns', FacilityMRNViewSet)
router.register(r'externalidentifiers', ExternalIdentifierViewSet)
router.register(r'patientmergelogs', PatientMergeLogViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'encounters', EncounterViewSet)
router.register(r'clinicalnotes', ClinicalNoteViewSet)
router.register(r'conditions', ConditionViewSet)
router.register(r'allergies', AllergyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
