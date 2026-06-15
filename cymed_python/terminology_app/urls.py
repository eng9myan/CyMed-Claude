from django.urls import path
from .views import search_concepts

urlpatterns = [
    path('search/', search_concepts, name='terminology_search'),
]
