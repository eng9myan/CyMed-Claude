from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceChargeViewSet, InvoiceViewSet, PaymentViewSet
from .multi_country_views import (
    list_countries, country_profile,
    multi_country_claim, multi_country_eligibility, multi_country_invoice,
)

router = DefaultRouter()
router.register(r"servicecharges", ServiceChargeViewSet)
router.register(r"invoices",       InvoiceViewSet)
router.register(r"payments",       PaymentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    # Multi-country
    path("countries/",                      list_countries,           name="billing-countries"),
    path("countries/<str:country_code>/",   country_profile,          name="billing-country-profile"),
    path("claim/submit/",                   multi_country_claim,      name="billing-claim-submit"),
    path("eligibility/",                    multi_country_eligibility, name="billing-eligibility"),
    path("invoice/generate/",               multi_country_invoice,    name="billing-invoice-generate"),
]
