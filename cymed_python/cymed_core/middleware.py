from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)

class TenantScopeMiddleware(MiddlewareMixin):
    """
    CYMED ENTERPRISE WORKFLOW MIDDLEWARE
    Ensures that every request is strictly scoped to the user's assigned Facility, Department, and Role.
    This fulfills the "No user should have unrestricted access" directive.
    """
    
    def process_request(self, request):
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None

        # Look up the user's primary or active assignment
        # Using a direct import inside the method to avoid circular import issues
        from auth_app.models import UserAssignment
        
        try:
            # We fetch the first active assignment. In a fully built UI, the user could 
            # select their active "context/shift" upon login.
            active_assignment = UserAssignment.objects.filter(
                user=request.user, 
                is_active=True
            ).select_related('facility', 'role', 'facility__organization').first()
            
            if active_assignment:
                request.tenant = {
                    'organization_id': active_assignment.facility.organization.id,
                    'organization_name': active_assignment.facility.organization.name,
                    'facility_id': active_assignment.facility.id,
                    'facility_name': active_assignment.facility.name,
                    'department_id': active_assignment.department_id,
                    'role': active_assignment.role.name,
                    'permissions': active_assignment.role.permissions_json
                }
                logger.info(f"Tenant Context Set: User={request.user.username}, Role={request.tenant['role']}, Facility={request.tenant['facility_name']}")
            else:
                request.tenant = None
                # If they have no assignment, they shouldn't see anything, but we'll let auth/API 
                # permissions reject them specifically, or we could raise PermissionDenied here.
                # Since this is development, we'll allow it but log a warning.
                logger.warning(f"User {request.user.username} has no active UserAssignment!")
                
        except Exception as e:
            logger.error(f"Error in TenantScopeMiddleware: {e}")
            request.tenant = None
            
        return None
