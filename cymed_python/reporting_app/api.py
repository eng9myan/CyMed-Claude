from ninja import Router
import time

router = Router(tags=["Reporting"])

@router.get("/clinical")
def get_clinical_report(request, start_date: str, end_date: str):
    return {
        "status": "success",
        "url": f"https://cymed.local/reports/clinical_{int(time.time())}.pdf"
    }

@router.get("/financial")
def get_financial_report(request, start_date: str, end_date: str):
    return {
        "status": "success",
        "url": f"https://cymed.local/reports/financial_{int(time.time())}.pdf"
    }
