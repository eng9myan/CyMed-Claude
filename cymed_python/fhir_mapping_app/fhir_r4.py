"""
FHIR R4 Resource builders.
Converts CyMed models → FHIR R4 JSON (NDJSON / Bundle).
Supports: Patient, Encounter, Observation, MedicationRequest, DiagnosticReport, Condition, Procedure.
"""
from __future__ import annotations
from datetime import datetime
from typing import Any


def build_patient(patient, country_code: str = "SA") -> dict:
    """GlobalPatient → FHIR R4 Patient resource (country-aware identifier systems).

    country_code: ISO 3166-1 alpha-2. Falls back to patient.country_code if set,
    otherwise the provided default (default "SA" for backwards compatibility).
    Identifier system URIs are resolved per country via CountryProfile.
    """
    # Patient's country takes precedence over caller-provided default
    cc = (getattr(patient, "country_code", None) or country_code or "SA").upper()

    try:
        from cymed_core.country_config import get_country
        profile = get_country(cc)
        gpid_system = f"https://cymed.{cc.lower()}/gpid"
        national_id_system = profile.health_id_system
    except Exception:
        # Safe fallback if CountryProfile lookup fails
        gpid_system = f"https://cymed.{cc.lower()}/gpid"
        national_id_system = {
            "SA": "https://nic.sa/national-id",
            "AE": "https://uaepass.ae/emirates-id",
            "GB": "https://fhir.nhs.uk/Id/nhs-number",
            "US": "http://hl7.org/fhir/sid/us-ssn",
            "JO": "https://nic.gov.jo/national-id",
            "KW": "https://paci.kw/civil-id",
            "QA": "https://moi.gov.qa/qid",
        }.get(cc, f"https://cymed.health/national-id/{cc}")

    resource: dict[str, Any] = {
        "resourceType": "Patient",
        "id": str(patient.id),
        "meta": {"profile": ["http://hl7.org/fhir/StructureDefinition/Patient"]},
        "identifier": [
            {
                "use": "official",
                "system": gpid_system,
                "value": patient.gpid,
            }
        ],
        "active": True,
        "name": [
            {
                "use": "official",
                "family": patient.last_name,
                "given":  [patient.first_name],
            }
        ],
        "gender": _gender(getattr(patient, "gender", "")),
        "birthDate": str(patient.date_of_birth) if patient.date_of_birth else None,
    }
    # Country marker (helpful for downstream consumers)
    resource["address"] = [{"country": cc}]

    if getattr(patient, "phone", ""):
        resource["telecom"] = [{"system": "phone", "value": patient.phone}]
    if getattr(patient, "email", ""):
        resource.setdefault("telecom", []).append({"system": "email", "value": patient.email})
    if getattr(patient, "national_id", ""):
        resource["identifier"].append({
            "use": "secondary",
            "system": national_id_system,
            "value": patient.national_id,
        })
    return resource


def build_encounter(encounter, patient_ref: str) -> dict:
    return {
        "resourceType": "Encounter",
        "id": str(encounter.id),
        "status": _encounter_status(encounter.workflow_status),
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code":   _encounter_class(encounter.encounter_type),
        },
        "subject": {"reference": f"Patient/{patient_ref}"},
        "period": {
            "start": _dt(encounter.registered_at),
            **({"end": _dt(encounter.discharged_at)} if encounter.discharged_at else {}),
        },
        "reasonCode": (
            [{"text": encounter.chief_complaint}] if encounter.chief_complaint else []
        ),
    }


def build_observation(vital: "VitalSigns", patient_ref: str, encounter_ref: str) -> list[dict]:
    """One VitalSigns record → multiple FHIR Observation resources."""
    observations = []
    mappings = [
        ("8480-6",  "Systolic BP",        vital.bp_systolic,      "mmHg"),
        ("8462-4",  "Diastolic BP",       vital.bp_diastolic,     "mmHg"),
        ("8867-4",  "Heart rate",         vital.heart_rate,       "/min"),
        ("9279-1",  "Respiratory rate",   vital.respiratory_rate, "/min"),
        ("8310-5",  "Body temperature",   vital.temperature_c,    "Cel"),
        ("2708-6",  "O2 saturation",      vital.spo2_pct,         "%"),
        ("29463-7", "Body weight",        vital.weight_kg,        "kg"),
        ("8302-2",  "Body height",        vital.height_cm,        "cm"),
        ("72514-3", "Pain severity",      vital.pain_score,       "{score}"),
        ("9269-2",  "Glasgow Coma Scale", vital.gcs,              "{score}"),
    ]
    for loinc, display, value, unit in mappings:
        if value is None:
            continue
        observations.append({
            "resourceType": "Observation",
            "id": f"{vital.id}-{loinc}",
            "status": "final",
            "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
            "code": {"coding": [{"system": "http://loinc.org", "code": loinc, "display": display}]},
            "subject": {"reference": f"Patient/{patient_ref}"},
            "encounter": {"reference": f"Encounter/{encounter_ref}"},
            "effectiveDateTime": _dt(vital.recorded_at),
            "valueQuantity": {"value": float(value), "unit": unit, "system": "http://unitsofmeasure.org"},
        })
    return observations


def build_medication_request(order, patient_ref: str, encounter_ref: str, prescriber_ref: str) -> dict:
    return {
        "resourceType": "MedicationRequest",
        "id": str(order.id),
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "text": getattr(order, "drug_name", str(order)),
        },
        "subject": {"reference": f"Patient/{patient_ref}"},
        "encounter": {"reference": f"Encounter/{encounter_ref}"},
        "requester": {"reference": f"Practitioner/{prescriber_ref}"},
        "dosageInstruction": [{
            "text": f"{getattr(order, 'dose', '')} {getattr(order, 'route', '')} {getattr(order, 'frequency', '')}",
        }],
        "authoredOn": _dt(getattr(order, "created_at", datetime.utcnow())),
    }


def build_diagnostic_report(lab_result, patient_ref: str) -> dict:
    return {
        "resourceType": "DiagnosticReport",
        "id": str(lab_result.id),
        "status": "final",
        "code": {
            "text": getattr(lab_result, "test_name", ""),
            "coding": [{"system": "http://loinc.org", "code": getattr(lab_result, "loinc_code", "")}],
        },
        "subject": {"reference": f"Patient/{patient_ref}"},
        "effectiveDateTime": _dt(getattr(lab_result, "resulted_at", datetime.utcnow())),
        "conclusion": getattr(lab_result, "interpretation", ""),
    }


def build_condition(diagnosis, patient_ref: str, encounter_ref: str) -> dict:
    return {
        "resourceType": "Condition",
        "id": str(getattr(diagnosis, "id", "")),
        "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
        "verificationStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]},
        "code": {
            "coding": [{
                "system": "http://id.who.int/icd/release/11/mms",
                "code":    getattr(diagnosis, "icd11_code", ""),
                "display": getattr(diagnosis, "description", ""),
            }],
        },
        "subject": {"reference": f"Patient/{patient_ref}"},
        "encounter": {"reference": f"Encounter/{encounter_ref}"},
    }


def build_bundle(resources: list[dict], bundle_type: str = "collection") -> dict:
    return {
        "resourceType": "Bundle",
        "type": bundle_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "entry": [{"resource": r} for r in resources],
        "total": len(resources),
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _dt(val) -> str:
    if val is None:
        return ""
    if isinstance(val, str):
        return val
    return val.isoformat()


def _gender(g: str) -> str:
    return {"M": "male", "F": "female", "O": "other"}.get(g.upper()[:1], "unknown")


def _encounter_status(ws: str) -> str:
    mapping = {
        "registered": "planned", "appointment_booked": "planned",
        "checked_in": "arrived", "triaged": "triaged", "waiting": "arrived",
        "in_consultation": "in-progress", "admitted": "in-progress",
        "in_bed": "in-progress", "in_surgery": "in-progress", "in_icu": "in-progress",
        "discharged": "finished", "billed": "finished", "closed": "finished",
        "cancelled": "cancelled",
    }
    return mapping.get(ws, "in-progress")


def _encounter_class(etype: str) -> str:
    return {"outpatient": "AMB", "emergency": "EMER", "inpatient": "IMP",
            "virtual": "VR", "surgery": "IMP"}.get(etype, "AMB")
