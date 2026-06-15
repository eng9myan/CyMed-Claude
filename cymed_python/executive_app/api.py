from ninja import Router

router = Router(tags=["Executive Intelligence"])

@router.get("/dashboards/ceo")
def api_ceo_dashboard(request):
    return {
        "status": "success",
        "data": {
            "enterprise_revenue_ytd": "$452M",
            "operating_margin": "12.4%",
            "system_bed_occupancy": "85.2%",
            "active_facilities": 14,
            "ai_briefing": "Revenue is trending 4% above target. High capacity utilization at main campus."
        }
    }

@router.get("/dashboards/cmo")
def api_cmo_dashboard(request):
    return {
        "status": "success",
        "data": {
            "active_sentinel_events": 0,
            "readmission_rate_30d": "11.2%",
            "mortality_rate": "1.4%",
            "ai_briefing": "Readmission rates have dropped 2% since implementation of AI Care Pathways."
        }
    }
