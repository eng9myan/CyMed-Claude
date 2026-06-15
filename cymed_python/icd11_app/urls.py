from django.urls import path
from . import views

urlpatterns = [
    path("search/",           views.icd11_search,      name="icd11-search"),
    path("code/<str:code>/",  views.icd11_code_detail, name="icd11-code-detail"),
    path("map/icd10/<str:icd10>/", views.icd10_map,    name="icd10-map"),
]
