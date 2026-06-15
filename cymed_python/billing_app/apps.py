from django.apps import AppConfig

class BillingAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'billing_app'

    def ready(self):
        from cymed_core.events import patient_registered, encounter_completed, medication_ordered, lab_ordered, radiology_ordered
        from billing_app.services import BillingWorkflowService
        
        def handle_registration(sender, **kwargs):
            BillingWorkflowService.handle_patient_registration(
                patient_id=kwargs.get('patient_id'),
                facility_id=kwargs.get('facility_id'),
                user_id=kwargs.get('user_id')
            )
            
        # VERY IMPORTANT: weak=False prevents the local function from being garbage collected
        patient_registered.connect(handle_registration, weak=False)
        
        encounter_completed.connect(BillingWorkflowService.handle_encounter_completed, dispatch_uid="billing_encounter_completed")
        medication_ordered.connect(BillingWorkflowService.handle_medication_ordered, dispatch_uid="billing_medication_ordered")
        lab_ordered.connect(BillingWorkflowService.handle_lab_ordered, dispatch_uid="billing_lab_ordered")
        radiology_ordered.connect(BillingWorkflowService.handle_radiology_ordered, dispatch_uid="billing_radiology_ordered")
