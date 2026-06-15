from ninja import Router

router = Router(tags=["Command Center"])

@router.get("/hospital/dashboard")
def api_hospital_dashboard(request):
    return {
        "status": "success",
        "data": {
            "bed_occupancy_rate": 82.5,
            "er_load": "HIGH",
            "icu_load": "CRITICAL",
            "operating_room_status": "NORMAL",
            "staffing_status": "SHORT_NURSING"
        }
    }

@router.get("/network/dashboard")
def api_network_dashboard(request):
    return {
        "status": "success",
        "data": {
            "total_hospitals_monitored": 5,
            "network_bed_occupancy": 78.2,
            "critical_alerts": 2
        }
    }
