from django.apps import AppConfig

class BedAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bed_app'

    def ready(self):
        from cymed_core.events import patient_discharged
        from .services import BedAllocationService

        def handle_discharge(sender, **kwargs):
            encounter_id = kwargs.get('encounter_id')
            if encounter_id:
                BedAllocationService.release_bed(encounter_id)
                
        patient_discharged.connect(handle_discharge, dispatch_uid="bed_release_on_discharge", weak=False)
