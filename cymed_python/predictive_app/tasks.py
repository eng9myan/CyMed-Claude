from celery import shared_task
from predictive_app.models import RiskScore
import random

@shared_task(name='predictive_app.tasks.process_clinical_event')
def process_clinical_event(patient_id: str, event_type: str, payload: dict):
    """
    Ingests real-time events (e.g. LAB_RESULT, VITALS_ENTERED) 
    and runs them through predictive models (mocked for now).
    """
    print(f"Predictive Engine ingested {event_type} for patient {patient_id}")
    
    # Mocking ML evaluation
    # In production, this would call a FastAPI / PyTorch inference endpoint
    
    # 1. 30-Day Readmission Risk
    readmission_score = random.uniform(0.1, 0.9)
    level = "HIGH" if readmission_score > 0.7 else "MEDIUM" if readmission_score > 0.4 else "LOW"
    
    RiskScore.objects.create(
        patient_id=patient_id,
        model_name="30-Day Readmission Risk",
        score=readmission_score,
        risk_level=level,
        factors={"event_trigger": event_type, "age_factor": payload.get('age', 50)}
    )
    
    # 2. Clinical Deterioration Risk (NEWS2 based)
    deterioration_score = random.uniform(1.0, 10.0)
    det_level = "CRITICAL" if deterioration_score > 7.0 else "WARNING" if deterioration_score > 4.0 else "NORMAL"
    
    RiskScore.objects.create(
        patient_id=patient_id,
        model_name="Clinical Deterioration Risk",
        score=deterioration_score,
        risk_level=det_level,
        factors={"trigger_vital": payload.get('vital', 'unknown')}
    )
    
    return {"status": "success", "scores_calculated": 2}
