from django.apps import AppConfig

class RadAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rad_app'

    def ready(self):
        from cymed_core.events import radiology_ordered
        from .services import RadiologyWorkflowService
        radiology_ordered.connect(RadiologyWorkflowService.handle_radiology_ordered, dispatch_uid="rad_app_ordered")
