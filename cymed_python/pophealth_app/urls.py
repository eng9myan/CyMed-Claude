from django.urls import path
from .views import disease_prevalence, readmission_rate

urlpatterns = [
    path("disease-prevalence/", disease_prevalence, name="pophealth-disease"),
    path("readmission-rate/",   readmission_rate,   name="pophealth-readmission"),
]

