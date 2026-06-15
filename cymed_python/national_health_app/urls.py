from django.urls import path
from .views import moh_summary, submit_moh_report

urlpatterns = [
    path("summary/",       moh_summary,       name="national-summary"),
    path("submit-report/", submit_moh_report, name="national-submit-report"),
]

