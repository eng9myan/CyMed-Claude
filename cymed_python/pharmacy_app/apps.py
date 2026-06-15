from django.apps import AppConfig

class PharmacyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pharmacy_app'

    def ready(self):
        from cymed_core.events import medication_ordered
        from .services import PharmacyWorkflowService
        medication_ordered.connect(PharmacyWorkflowService.handle_medication_ordered, weak=False)
