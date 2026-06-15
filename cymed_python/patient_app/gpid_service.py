"""
Global Patient Identifier (GPID) generation and lookup.
Format: CYM-{COUNTRY}-{YEAR}-{UUID7_SHORT}
Example: CYM-SA-2026-01J9K8B7C6D5
"""
from __future__ import annotations

import re
import uuid6
from datetime import date
from django.db import transaction


GPID_RE = re.compile(r"^CYM-[A-Z]{2}-\d{4}-[0-9A-Z]{12,26}$")


def generate_gpid(country_code: str = "SA") -> str:
    country = country_code.upper()[:2]
    year    = date.today().year
    uid     = uuid6.uuid7().hex.upper()[:16]
    return f"CYM-{country}-{year}-{uid}"


def validate_gpid(gpid: str) -> bool:
    return bool(GPID_RE.match(gpid))


def get_or_create_global_patient(
    *,
    first_name: str,
    last_name: str,
    date_of_birth,
    national_id: str = "",
    country_code: str = "SA",
    facility_id=None,
    facility_mrn: str = "",
    created_by=None,
) -> tuple:
    """
    Returns (GlobalPatient, created: bool).
    Deduplicates by national_id if provided, else by name + DOB.
    """
    from .models import GlobalPatient, FacilityMRN

    with transaction.atomic():
        # 1. Try exact national_id match
        if national_id:
            existing = GlobalPatient.objects.filter(national_id=national_id).first()
            if existing:
                _ensure_facility_mrn(existing, facility_id, facility_mrn)
                return existing, False

        # 2. Try name + DOB (fuzzy match)
        existing = GlobalPatient.objects.filter(
            first_name__iexact=first_name,
            last_name__iexact=last_name,
            date_of_birth=date_of_birth,
        ).first()
        if existing:
            _ensure_facility_mrn(existing, facility_id, facility_mrn)
            return existing, False

        # 3. Create new
        gpid    = generate_gpid(country_code)
        patient = GlobalPatient.objects.create(
            gpid           = gpid,
            first_name     = first_name,
            last_name      = last_name,
            date_of_birth  = date_of_birth,
            national_id    = national_id,
            created_by     = created_by,
        )
        _ensure_facility_mrn(patient, facility_id, facility_mrn)
        return patient, True


def _ensure_facility_mrn(patient, facility_id, mrn: str):
    if not facility_id or not mrn:
        return
    from .models import FacilityMRN
    FacilityMRN.objects.get_or_create(
        patient=patient,
        facility_id=facility_id,
        defaults={"mrn": mrn},
    )


def lookup_by_gpid(gpid: str):
    from .models import GlobalPatient
    try:
        return GlobalPatient.objects.get(gpid=gpid)
    except GlobalPatient.DoesNotExist:
        return None


def lookup_by_mrn(mrn: str, facility_id):
    from .models import FacilityMRN
    try:
        return FacilityMRN.objects.select_related("patient").get(
            mrn=mrn, facility_id=facility_id
        ).patient
    except FacilityMRN.DoesNotExist:
        return None
