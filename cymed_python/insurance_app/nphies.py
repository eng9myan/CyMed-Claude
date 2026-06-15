"""
NPHIES (National Platform for Health Information Exchange System) Integration
Saudi Arabia insurance claim submission, eligibility verification, pre-authorization.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime
from typing import Any

import requests

log = logging.getLogger("nphies")

NPHIES_BASE_URL = os.environ.get("NPHIES_BASE_URL", "https://HSB.nphies.sa/claimsubmission/api")
NPHIES_TOKEN_URL = os.environ.get("NPHIES_TOKEN_URL", "https://HSB.nphies.sa/claimsubmission/api/token")


def _get_token() -> str:
    from django.core.cache import cache
    token = cache.get("nphies:token")
    if token:
        return token
    resp = requests.post(NPHIES_TOKEN_URL, data={
        "grant_type":    "client_credentials",
        "client_id":     os.environ.get("NPHIES_CLIENT_ID", ""),
        "client_secret": os.environ.get("NPHIES_CLIENT_SECRET", ""),
    }, timeout=15)
    resp.raise_for_status()
    data   = resp.json()
    token  = data["access_token"]
    cache.set("nphies:token", token, int(data.get("expires_in", 3600)) - 60)
    return token


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_get_token()}",
        "Content-Type":  "application/json",
    }


def check_eligibility(
    *,
    patient_national_id: str,
    insurance_member_id: str,
    payer_id: str,
    facility_nphies_id: str,
    service_date: str,
) -> dict:
    """Verify patient insurance eligibility in real-time."""
    bundle = {
        "resourceType": "Bundle",
        "id": str(uuid.uuid4()),
        "meta": {"profile": ["http://nphies.sa/fhir/ksa/nphies-fs/StructureDefinition/eligibility-request"]},
        "type": "message",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "entry": [
            {
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": {
                    "resourceType": "CoverageEligibilityRequest",
                    "id": str(uuid.uuid4()),
                    "status": "active",
                    "purpose": ["benefits"],
                    "patient": {"identifier": {"value": patient_national_id}},
                    "servicedDate": service_date,
                    "insurer": {"identifier": {"value": payer_id}},
                    "insurance": [{"coverage": {"identifier": {"value": insurance_member_id}}}],
                },
            }
        ],
    }
    try:
        resp = requests.post(
            f"{NPHIES_BASE_URL}/CoverageEligibilityRequest",
            json=bundle, headers=_headers(), timeout=15
        )
        return resp.json()
    except Exception as exc:
        log.error("NPHIES eligibility check failed: %s", exc)
        return {"error": str(exc)}


def submit_pre_auth(
    *,
    claim_data: dict,
    facility_nphies_id: str,
) -> dict:
    """Submit prior authorization request."""
    bundle = _build_claim_bundle(claim_data, claim_type="preauthorization", facility_id=facility_nphies_id)
    try:
        resp = requests.post(
            f"{NPHIES_BASE_URL}/Claim",
            json=bundle, headers=_headers(), timeout=30
        )
        return resp.json()
    except Exception as exc:
        log.error("NPHIES pre-auth failed: %s", exc)
        return {"error": str(exc)}


def submit_claim(
    *,
    claim_data: dict,
    facility_nphies_id: str,
) -> dict:
    """Submit final insurance claim."""
    bundle = _build_claim_bundle(claim_data, claim_type="claim", facility_id=facility_nphies_id)
    try:
        resp = requests.post(
            f"{NPHIES_BASE_URL}/Claim",
            json=bundle, headers=_headers(), timeout=30
        )
        return resp.json()
    except Exception as exc:
        log.error("NPHIES claim submission failed: %s", exc)
        return {"error": str(exc)}


def appeal_denial(
    *,
    original_claim_id: str,
    denial_code: str,
    appeal_reason: str,
    supporting_docs: list[str],
    facility_nphies_id: str,
) -> dict:
    """Auto-submit denial appeal with AI-generated appeal letter."""
    from ai_platform.gateway import complete
    appeal_text = complete(
        messages=[{
            "role": "user",
            "content": (
                f"Write a professional insurance denial appeal for Saudi NPHIES. "
                f"Original claim: {original_claim_id}. "
                f"Denial code: {denial_code}. "
                f"Reason for appeal: {appeal_reason}. "
                "Keep it factual, cite clinical necessity, reference evidence-based guidelines."
            ),
        }],
        system="You are a medical billing specialist writing NPHIES appeal letters.",
        max_tokens=800,
        use_case="denial_appeal",
    ).text

    payload = {
        "resourceType": "ClaimResponse",
        "id": str(uuid.uuid4()),
        "status": "active",
        "request": {"identifier": {"value": original_claim_id}},
        "outcome": "queued",
        "disposition": appeal_text,
        "processNote": [{"text": appeal_reason}],
    }
    try:
        resp = requests.post(
            f"{NPHIES_BASE_URL}/ClaimResponse",
            json=payload, headers=_headers(), timeout=30
        )
        return {**resp.json(), "appeal_letter": appeal_text}
    except Exception as exc:
        log.error("NPHIES appeal submission failed: %s", exc)
        return {"error": str(exc), "appeal_letter": appeal_text}


def _build_claim_bundle(claim_data: dict, claim_type: str, facility_id: str) -> dict:
    return {
        "resourceType": "Bundle",
        "id": str(uuid.uuid4()),
        "type": "message",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "entry": [
            {
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": {
                    "resourceType": "Claim",
                    "id": str(uuid.uuid4()),
                    "status": "active",
                    "type": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/claim-type", "code": "institutional"}]},
                    "use": claim_type,
                    "patient": {"identifier": {"value": claim_data.get("patient_national_id", "")}},
                    "created": datetime.utcnow().isoformat() + "Z",
                    "insurer": {"identifier": {"value": claim_data.get("payer_id", "")}},
                    "provider": {"identifier": {"value": facility_id}},
                    "priority": {"coding": [{"code": "normal"}]},
                    "total": {
                        "value": float(claim_data.get("total_amount", 0)),
                        "currency": "SAR",
                    },
                    "diagnosis": [
                        {
                            "sequence": i + 1,
                            "diagnosisCodeableConcept": {
                                "coding": [{
                                    "system": "http://id.who.int/icd/release/11/mms",
                                    "code": d,
                                }]
                            },
                        }
                        for i, d in enumerate(claim_data.get("diagnoses", []))
                    ],
                    "item": [
                        {
                            "sequence": i + 1,
                            "productOrService": {
                                "coding": [{"system": "http://nphies.sa/CodeSystem/services", "code": item.get("service_code", "")}],
                                "text": item.get("description", ""),
                            },
                            "quantity": {"value": item.get("quantity", 1)},
                            "unitPrice": {"value": float(item.get("unit_price", 0)), "currency": "SAR"},
                            "net": {"value": float(item.get("net", 0)), "currency": "SAR"},
                        }
                        for i, item in enumerate(claim_data.get("items", []))
                    ],
                },
            }
        ],
    }
