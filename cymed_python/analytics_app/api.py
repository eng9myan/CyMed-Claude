from ninja import Router
from pydantic import BaseModel
import random
import time

router = Router()

class RiskPrediction(BaseModel):
    patient_id: str
    risk_score: float
    risk_category: str
    key_factors: list[str]
    recommendation: str

@router.get("/predict/readmission/{patient_id}", response=RiskPrediction)
def predict_readmission_risk(request, patient_id: str):
    # Simulate a complex ML inference delay
    time.sleep(0.5)
    
    # Generate mock prediction
    score = random.uniform(15.0, 92.5)
    category = "Low"
    if score > 75:
        category = "High"
    elif score > 45:
        category = "Medium"
        
    factors = []
    if score > 60:
        factors.append("Recent elevated blood pressure (145/90)")
    if score > 80:
        factors.append("ICD-11 Code 5A11 (Type 2 Diabetes Mellitus)")
        factors.append("Missed previous follow-up")
    if not factors:
        factors.append("Stable vitals history")
        
    rec = "Standard annual follow-up."
    if category == "High":
        rec = "Immediate telehealth outreach and medication review recommended."
    elif category == "Medium":
        rec = "Schedule follow-up within 14 days."

    return {
        "patient_id": patient_id,
        "risk_score": round(score, 1),
        "risk_category": category,
        "key_factors": factors,
        "recommendation": rec
    }
