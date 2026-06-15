from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
import redis
import os

from auth_app.jwt_views import login, refresh_token, logout, me
from cymed_core.erp_api import api as erp_api


def health_check(request):
    checks = {"status": "ok", "database": "ok", "cache": "ok", "version": "2.0.0"}
    try:
        connection.ensure_connection()
    except Exception:
        checks["database"] = "error"
        checks["status"]   = "degraded"
    try:
        r = redis.from_url(os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0"))
        r.ping()
    except Exception:
        checks["cache"]  = "error"
        checks["status"] = "degraded"
    return JsonResponse(checks, status=200 if checks["status"] == "ok" else 503)


urlpatterns = [
    # System
    path("api/health/", health_check,     name="health-check"),
    path("admin/",      admin.site.urls),

    # Auth — custom JWT
    path("api/v1/auth/login/",   login,         name="auth-login"),
    path("api/v1/auth/refresh/", refresh_token, name="auth-refresh"),
    path("api/v1/auth/logout/",  logout,        name="auth-logout"),
    path("api/v1/auth/me/",      me,            name="auth-me"),

    # Clinical core
    path("api/v1/patient/",     include("patient_app.urls")),
    path("api/v1/consent/",     include("consent_app.urls")),
    path("api/v1/admission/",   include("admission_app.urls")),
    path("api/v1/nursing/",     include("nursing_app.urls")),
    path("api/v1/bed/",         include("bed_app.urls")),
    path("api/v1/scheduling/",  include("scheduling_app.urls")),

    # Diagnostics
    path("api/v1/lab/",         include("lab_app.urls")),
    path("api/v1/radiology/",   include("rad_app.urls")),

    # Pharmacy
    path("api/v1/pharmacy/",    include("pharmacy_app.urls")),

    # Finance
    path("api/v1/billing/",     include("billing_app.urls")),
    path("api/v1/insurance/",   include("insurance_app.urls")),
    path("api/v1/zatca/",       include("zatca_compliance.urls")),

    # AI Platform
    path("api/v1/ai/",          include("ai_platform.urls")),

    # Terminology
    path("api/v1/icd11/",       include("icd11_app.urls")),

    # FHIR R4
    path("api/fhir/", include("fhir_mapping_app.urls")),

    # Interoperability
    path("api/v1/hl7/",         include("hl7_engine.urls")),

    # Analytics & Reporting
    path("api/v1/analytics/",   include("analytics_app.urls")),
    path("api/v1/reporting/",   include("reporting_app.urls")),

    # National / Population Health
    path("api/v1/national/",    include("national_health_app.urls")),
    path("api/v1/pophealth/",   include("pophealth_app.urls")),
    path("api/v1/rpm/",         include("rpm_app.urls")),

    # Audit
    path("api/v1/audit/",       include("audit_log_app.urls")),

    # ERP Backbone (Finance, Inventory, HR, Payroll, Procurement, Assets)
    path("api/v1/erp/", erp_api.urls),

    # OpenAPI Docs
    path("api/schema/",         SpectacularAPIView.as_view(),                      name="schema"),
    path("api/schema/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/",   SpectacularRedocView.as_view(url_name="schema"),   name="redoc"),
]
