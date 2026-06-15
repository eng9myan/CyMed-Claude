import json
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog

class AuditLogMiddleware(MiddlewareMixin):
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def process_request(self, request):
        # We need to capture the raw body before it gets consumed by the view
        if request.method in ['POST', 'PUT', 'PATCH'] and request.path.startswith('/api/'):
            try:
                # Store it on the request object
                request._audit_payload = json.loads(request.body)
            except Exception:
                request._audit_payload = None
                
    def process_response(self, request, response):
        if not request.path.startswith('/api/'):
            return response
            
        method_map = {
            'GET': 'READ', 'POST': 'CREATE', 'PUT': 'UPDATE', 
            'PATCH': 'UPDATE', 'DELETE': 'DELETE'
        }
        action = method_map.get(request.method, 'UNKNOWN')
        
        user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
        ip_address = self.get_client_ip(request)
        endpoint = request.path
        device = request.META.get('HTTP_USER_AGENT', '')
        
        parts = request.path.strip('/').split('/')
        resource_type = parts[1].capitalize() if len(parts) >= 2 else 'Unknown'
        resource_id = parts[2] if len(parts) >= 3 else None
        
        after_value = getattr(request, '_audit_payload', None)
        
        try:
            AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                endpoint=endpoint,
                device=device,
                after_value=after_value
            )
        except Exception:
            pass
            
        return response
