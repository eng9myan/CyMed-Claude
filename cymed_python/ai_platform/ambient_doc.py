"""
AI Ambient Documentation — Whisper transcription → Claude SOAP note generator.
Supports streaming generation via Server-Sent Events (SSE).
"""
from __future__ import annotations

import logging
import os
from typing import Iterator

log = logging.getLogger("ambient_doc")

SOAP_SYSTEM_PROMPT = """You are an expert medical scribe for a Saudi Arabian hospital using CyMed HMRS.
Generate a professional clinical SOAP note from the transcription provided.

Format EXACTLY as:

## Subjective
[Patient's chief complaint, history of present illness, symptoms, duration, severity]

## Objective
[Vital signs if mentioned, physical examination findings, lab/imaging results if mentioned]

## Assessment
[Primary diagnosis with ICD-11 code if possible, differential diagnoses]

## Plan
[Medications with doses, procedures, follow-up, referrals, patient education]

---
Rules:
- Use medical terminology
- Be concise but complete
- If information is not in the transcript, write "Not documented"
- Flag any critical findings with [CRITICAL]
- Suggest ICD-11 codes where appropriate
- Arabic patient names should be preserved exactly
"""


def transcription_to_soap(transcription: str, *, patient_context: dict | None = None) -> str:
    """Convert raw voice transcription to structured SOAP note (non-streaming)."""
    from ai_platform.gateway import complete

    context_str = ""
    if patient_context:
        context_str = f"\n\nPatient Context:\n{_format_context(patient_context)}"

    response = complete(
        messages=[{
            "role": "user",
            "content": f"TRANSCRIPTION:\n{transcription}{context_str}\n\nGenerate SOAP note:",
        }],
        system=SOAP_SYSTEM_PROMPT,
        max_tokens=1500,
        temperature=0.2,
        use_case="ambient_documentation",
    )
    log.info("SOAP note generated via %s (%.0fms)", response.provider, response.latency_ms)
    return response.text


def transcription_to_soap_stream(
    transcription: str,
    *,
    patient_context: dict | None = None,
) -> Iterator[str]:
    """Streaming SOAP note generator — yields text chunks for SSE."""
    from ai_platform.gateway import stream

    context_str = ""
    if patient_context:
        context_str = f"\n\nPatient Context:\n{_format_context(patient_context)}"

    yield from stream(
        messages=[{
            "role": "user",
            "content": f"TRANSCRIPTION:\n{transcription}{context_str}\n\nGenerate SOAP note:",
        }],
        system=SOAP_SYSTEM_PROMPT,
        max_tokens=1500,
        temperature=0.2,
        use_case="ambient_documentation_stream",
    )


def extract_orders_from_soap(soap_note: str) -> dict:
    """
    Use AI to extract structured orders from a SOAP note.
    Returns {medications: [], lab_orders: [], imaging_orders: [], referrals: []}.
    """
    from ai_platform.gateway import complete

    result = complete(
        messages=[{
            "role": "user",
            "content": (
                f"Extract all clinical orders from this SOAP note as JSON.\n\n{soap_note}\n\n"
                "Return ONLY valid JSON with keys: medications (list of {name,dose,route,frequency}), "
                "lab_orders (list of {test_name}), imaging_orders (list of {modality,body_part,reason}), "
                "referrals (list of {specialty,reason})."
            ),
        }],
        system="You are a medical order extraction AI. Return only valid JSON, no markdown.",
        max_tokens=800,
        temperature=0,
        use_case="order_extraction",
    )
    import json
    try:
        return json.loads(result.text)
    except json.JSONDecodeError:
        log.warning("Order extraction JSON parse failed")
        return {"medications": [], "lab_orders": [], "imaging_orders": [], "referrals": []}


def generate_discharge_summary(encounter_data: dict) -> str:
    """Generate discharge summary from encounter data."""
    from ai_platform.gateway import complete

    result = complete(
        messages=[{
            "role": "user",
            "content": (
                f"Generate a professional hospital discharge summary from this encounter data:\n"
                f"{encounter_data}\n\n"
                "Include: admission reason, hospital course, procedures performed, "
                "final diagnosis, discharge medications, follow-up instructions, activity restrictions."
            ),
        }],
        system="You are a medical documentation specialist at a Saudi hospital. Write formal discharge summaries.",
        max_tokens=1200,
        temperature=0.2,
        use_case="discharge_summary",
    )
    return result.text


def _format_context(ctx: dict) -> str:
    parts = []
    if ctx.get("patient_name"):  parts.append(f"Name: {ctx['patient_name']}")
    if ctx.get("age"):           parts.append(f"Age: {ctx['age']}")
    if ctx.get("gender"):        parts.append(f"Gender: {ctx['gender']}")
    if ctx.get("allergies"):     parts.append(f"Allergies: {', '.join(ctx['allergies'])}")
    if ctx.get("medications"):   parts.append(f"Current Meds: {', '.join(ctx['medications'])}")
    if ctx.get("diagnoses"):     parts.append(f"Known Diagnoses: {', '.join(ctx['diagnoses'])}")
    return "\n".join(parts)
