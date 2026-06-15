from celery import shared_task
from .models import AiTokenUsage, AiProvider
from .services import MultiProviderAIGateway
import time

@shared_task
def generate_patient_summary(patient_id, context_data):
    gateway = MultiProviderAIGateway(user_id=patient_id)
    return gateway.generate_clinical_insight(context_data, intent="PATIENT_SUMMARY")

@shared_task
def clinical_note_assistance(note_id, context_data):
    gateway = MultiProviderAIGateway(user_id=note_id)
    return gateway.generate_clinical_insight(context_data, intent="CLINICAL_NOTE_ASSISTANCE")

@shared_task
def draft_care_plan(patient_id, context_data):
    gateway = MultiProviderAIGateway(user_id=patient_id)
    return gateway.generate_clinical_insight(context_data, intent="CARE_PLAN_DRAFT")

@shared_task
def optimize_staffing(department_id, context_data):
    gateway = MultiProviderAIGateway(user_id=department_id)
    return gateway.generate_clinical_insight(context_data, intent="STAFFING_OPTIMIZATION")

@shared_task
def forecast_revenue(facility_id, context_data):
    gateway = MultiProviderAIGateway(user_id=facility_id)
    return gateway.generate_clinical_insight(context_data, intent="REVENUE_FORECASTING")

@shared_task
def predict_risk(patient_id, context_data):
    gateway = MultiProviderAIGateway(user_id=patient_id)
    return gateway.generate_clinical_insight(context_data, intent="RISK_PREDICTION")
