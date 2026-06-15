from ninja import Router
from typing import List, Dict
from ninja import Schema
from .services import ClinicalAIAssistant, PatientChatbotAssistant

router = Router(tags=["AI Services"])

class SOAPRequest(Schema):
    raw_notes: str

class ChatRequest(Schema):
    message: str

@router.post("/soap", response=str)
def generate_soap(request, payload: SOAPRequest):
    return ClinicalAIAssistant.generate_soap_note(payload.raw_notes)

@router.post("/chat", response=str)
def chat_with_copilot(request, payload: ChatRequest):
    return PatientChatbotAssistant.chat(payload.message)
