import os
import google.generativeai as genai

# Configure Gemini AI using the API key
genai.configure(api_key=os.environ.get('GEMINI_API_KEY', 'mock_key'))

class ClinicalAIAssistant:
    @staticmethod
    def generate_soap_note(raw_notes: str) -> str:
        if os.environ.get('GEMINI_API_KEY') == 'mock_key' or not os.environ.get('GEMINI_API_KEY'):
            # Fallback for dev mode
            return "Subjective: Patient reports headache.\nObjective: BP 120/80.\nAssessment: Tension headache.\nPlan: Rest."
            
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"Convert the following raw clinical notes into a structured SOAP (Subjective, Objective, Assessment, Plan) format:\n\n{raw_notes}"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating SOAP note: {e}"

class OperationsAIAssistant:
    @staticmethod
    def optimize_bed_allocation() -> dict:
        return {"recommendation": "Move 5 patients from ED to General Ward to free up ICU overflow."}

class FinancialAIAssistant:
    @staticmethod
    def predict_revenue() -> dict:
        return {"prediction": "150000", "confidence": "85%"}

class PatientChatbotAssistant:
    @staticmethod
    def chat(message: str) -> str:
        if os.environ.get('GEMINI_API_KEY') == 'mock_key' or not os.environ.get('GEMINI_API_KEY'):
            return "Hello! I am the CyMed Patient Copilot. I'm currently in offline mode."

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"You are the CyMed Patient Copilot, a helpful AI assistant for patients. The patient says: '{message}'. Respond politely and helpfully."
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error communicating with AI: {e}"
