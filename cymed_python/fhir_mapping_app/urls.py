from django.urls import path
from .views import capability_statement, patient_fhir, encounter_fhir, patient_everything

urlpatterns = [
    path("metadata",                              capability_statement,   name="fhir-metadata"),
    path("Patient/<str:patient_id>/",             patient_fhir,           name="fhir-patient"),
    path("Patient/<str:patient_id>/$everything",  patient_everything,     name="fhir-patient-everything"),
    path("Encounter/<str:encounter_id>/",         encounter_fhir,         name="fhir-encounter"),
]
