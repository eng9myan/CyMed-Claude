from django.urls import path
from .views import census_report, lab_tat_report, financial_summary

urlpatterns = [
    path("census/",    census_report,     name="report-census"),
    path("lab-tat/",   lab_tat_report,    name="report-lab-tat"),
    path("financial/", financial_summary, name="report-financial"),
]

