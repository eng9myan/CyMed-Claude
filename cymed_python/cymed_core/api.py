from ninja import NinjaAPI
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from ninja.security import HttpBearer

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        jwt_authenticator = JWTAuthentication()
        try:
            validated_token = jwt_authenticator.get_validated_token(token)
            user = jwt_authenticator.get_user(validated_token)
            request.user = user
            return token
        except Exception:
            return None

api = NinjaAPI(
    title="CyMed Enterprise API",
    version="1.0.0",
    description="Unified API Gateway for the CyMed Healthcare Ecosystem",
    auth=JWTAuth() # Enabled for Enterprise Security
)

# We will import and register routers here
from patient_app.api import router as patient_router
from hr_app.api import router as provider_router
from lab_app.api import router as lab_router
from pharmacy_app.api import router as pharmacy_router
from rad_app.api import router as rad_router
from finance_app.api import router as finance_router
from nursing_app.api import router as nursing_router
from admission_app.api import router as admission_router
from inventory_app.api import router as inventory_router
from procurement_app.api import router as procurement_router
from bed_app.api import router as bed_router
from billing_app.api import router as billing_router
from ai_app.api import router as ai_router
from interop_app.api import router as interop_router
from reporting_app.api import router as reporting_router
from executive_app.api import router as executive_router

from blood_bank_app.api import router as blood_bank_router
from dialysis_app.api import router as dialysis_router
from oncology_app.api import router as oncology_router
from cardiology_app.api import router as cardiology_router
from pediatrics_app.api import router as pediatrics_router
from maternity_app.api import router as maternity_router
from dental_app.api import router as dental_router
from education_app.api import router as education_router
from command_center_app.api import router as command_center_router
from terminology_app.api import router as terminology_router
from analytics_app.api import router as analytics_router

api.add_router("/patients", patient_router)
api.add_router("/providers", provider_router)
api.add_router("/lab", lab_router)
api.add_router("/pharmacy", pharmacy_router)
api.add_router("/radiology", rad_router)
api.add_router("/finance", finance_router)
api.add_router("/nursing", nursing_router)
api.add_router("/admissions", admission_router)
api.add_router("/inventory", inventory_router)
api.add_router("/procurement", procurement_router)
api.add_router("/beds", bed_router)
api.add_router("/billing", billing_router)
api.add_router("/ai", ai_router)
api.add_router("/interop", interop_router)
api.add_router("/reporting", reporting_router)
api.add_router("/executive", executive_router)
api.add_router("/terminology", terminology_router)

from fhir_mapping_app.api import router as fhir_router

api.add_router("/blood-bank", blood_bank_router)
api.add_router("/dialysis", dialysis_router)
api.add_router("/oncology", oncology_router)
api.add_router("/cardiology", cardiology_router)
api.add_router("/pediatrics", pediatrics_router)
api.add_router("/maternity", maternity_router)
api.add_router("/dental", dental_router)
api.add_router("/education", education_router)
api.add_router("/command-center", command_center_router)
api.add_router("/analytics", analytics_router)
api.add_router("/fhir", fhir_router)
