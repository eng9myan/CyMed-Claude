from django.apps import AppConfig

class LabAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lab_app'

    def ready(self):
        from cymed_core.events import lab_ordered
        from .services import LabWorkflowService
        lab_ordered.connect(LabWorkflowService.handle_lab_ordered, dispatch_uid="lab_app_ordered")
