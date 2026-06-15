"""Central Django-Ninja API for all ERP backbone modules."""
from ninja import NinjaAPI
from ninja.security import HttpBearer
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            validated = UntypedToken(token)
            user = User.objects.get(id=validated["user_id"])
            request.user = user
            return user
        except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
            return None


api = NinjaAPI(title="CyMed ERP API", version="1.0", auth=JWTBearer())

from finance_app.api       import router as finance_router
from inventory_app.api     import router as inventory_router
from hr_app.api            import router as hr_router
from payroll_app.api       import router as payroll_router
from procurement_app.api   import router as procurement_router
from asset_management_app.api import router as assets_router
from crm_app.api           import router as crm_router

api.add_router("/finance",     finance_router,     tags=["Finance"])
api.add_router("/inventory",   inventory_router,   tags=["Inventory"])
api.add_router("/hr",          hr_router,          tags=["HR"])
api.add_router("/payroll",     payroll_router,     tags=["Payroll"])
api.add_router("/procurement", procurement_router, tags=["Procurement"])
api.add_router("/assets",      assets_router,      tags=["Assets"])
api.add_router("/crm",         crm_router,         tags=["CRM"])
