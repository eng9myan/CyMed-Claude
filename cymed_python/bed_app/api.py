from ninja import Router, Schema
from uuid import UUID
from .services import clean_bed, set_bed_maintenance, get_available_beds

router = Router(tags=["Bed Management"])

@router.post("/{bed_id}/clean")
def api_clean_bed(request, bed_id: UUID):
    bed = clean_bed(bed_id)
    return {"status": "success", "bed_id": str(bed.id)}

@router.post("/{bed_id}/maintenance")
def api_set_maintenance(request, bed_id: UUID):
    bed = set_bed_maintenance(bed_id)
    return {"status": "success", "bed_id": str(bed.id)}

@router.get("/available")
def api_get_available_beds(request, ward_id: UUID = None):
    beds = get_available_beds(ward_id)
    return [
        {
            "id": str(b.id),
            "bed_number": b.bed_number,
            "ward_name": b.ward.name if b.ward else None
        }
        for b in beds
    ]

from .models import Bed

@router.get("/")
def api_get_all_beds(request):
    beds = Bed.objects.all()
    return [
        {
            "id": str(b.id),
            "bed_number": b.bed_number,
            "status": b.status,
            "ward_name": b.ward.name if b.ward else None
        }
        for b in beds
    ]
