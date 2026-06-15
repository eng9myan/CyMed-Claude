"""
Patient Journey Workflow Engine
Registration → Appointment → Check-In → Triage → Consultation → Orders →
Lab → Imaging → Pharmacy → Billing → Admission → Bed → Nursing → Surgery →
ICU → Discharge → Final Billing → Follow-Up

State machine: each encounter moves through well-defined states.
"""
from __future__ import annotations
import logging
from django.db import transaction
from django.utils import timezone

log = logging.getLogger("patient_journey")

# ── States ────────────────────────────────────────────────────────────────────
class EncounterState:
    REGISTERED        = "registered"
    APPOINTMENT_BOOKED= "appointment_booked"
    CHECKED_IN        = "checked_in"
    TRIAGED           = "triaged"
    WAITING           = "waiting"
    IN_CONSULTATION   = "in_consultation"
    ORDERS_PENDING    = "orders_pending"
    AWAITING_RESULTS  = "awaiting_results"
    ADMITTED          = "admitted"
    IN_BED            = "in_bed"
    IN_SURGERY        = "in_surgery"
    IN_ICU            = "in_icu"
    DISCHARGE_PLANNING= "discharge_planning"
    DISCHARGED        = "discharged"
    BILLED            = "billed"
    CLOSED            = "closed"
    CANCELLED         = "cancelled"

# Legal transitions
TRANSITIONS: dict[str, list[str]] = {
    EncounterState.REGISTERED:          [EncounterState.APPOINTMENT_BOOKED, EncounterState.CHECKED_IN, EncounterState.CANCELLED],
    EncounterState.APPOINTMENT_BOOKED:  [EncounterState.CHECKED_IN, EncounterState.CANCELLED],
    EncounterState.CHECKED_IN:          [EncounterState.TRIAGED, EncounterState.WAITING, EncounterState.IN_CONSULTATION],
    EncounterState.TRIAGED:             [EncounterState.WAITING, EncounterState.IN_CONSULTATION, EncounterState.ADMITTED],
    EncounterState.WAITING:             [EncounterState.IN_CONSULTATION],
    EncounterState.IN_CONSULTATION:     [EncounterState.ORDERS_PENDING, EncounterState.DISCHARGE_PLANNING, EncounterState.ADMITTED],
    EncounterState.ORDERS_PENDING:      [EncounterState.AWAITING_RESULTS, EncounterState.ADMITTED, EncounterState.DISCHARGE_PLANNING],
    EncounterState.AWAITING_RESULTS:    [EncounterState.IN_CONSULTATION, EncounterState.ADMITTED, EncounterState.DISCHARGE_PLANNING],
    EncounterState.ADMITTED:            [EncounterState.IN_BED, EncounterState.IN_SURGERY, EncounterState.IN_ICU],
    EncounterState.IN_BED:              [EncounterState.IN_SURGERY, EncounterState.IN_ICU, EncounterState.DISCHARGE_PLANNING],
    EncounterState.IN_SURGERY:          [EncounterState.IN_ICU, EncounterState.IN_BED, EncounterState.DISCHARGE_PLANNING],
    EncounterState.IN_ICU:              [EncounterState.IN_BED, EncounterState.DISCHARGE_PLANNING],
    EncounterState.DISCHARGE_PLANNING:  [EncounterState.DISCHARGED],
    EncounterState.DISCHARGED:          [EncounterState.BILLED],
    EncounterState.BILLED:              [EncounterState.CLOSED],
    EncounterState.CLOSED:              [],
    EncounterState.CANCELLED:           [],
}


def transition(encounter, new_state: str, *, user, notes: str = "") -> None:
    """
    Advance encounter to new_state.
    Raises ValueError if transition is illegal.
    Records a WorkflowEvent audit entry.
    """
    current = encounter.workflow_status
    allowed = TRANSITIONS.get(current, [])
    if new_state not in allowed:
        raise ValueError(
            f"Illegal transition: {current} → {new_state}. "
            f"Allowed: {allowed}"
        )
    with transaction.atomic():
        old_state               = encounter.workflow_status
        encounter.workflow_status = new_state
        encounter.updated_at    = timezone.now()
        _set_timestamps(encounter, new_state)
        encounter.save(update_fields=["workflow_status", "updated_at",
                                       "admitted_at", "discharged_at"])
        _record_workflow_event(encounter, old_state, new_state, user, notes)

    log.info("Encounter %s: %s → %s by user %s", encounter.id, old_state, new_state, user.id if user else "system")


def _set_timestamps(encounter, state: str):
    now = timezone.now()
    if state == EncounterState.ADMITTED and not encounter.admitted_at:
        encounter.admitted_at = now
    if state == EncounterState.DISCHARGED and not encounter.discharged_at:
        encounter.discharged_at = now


def _record_workflow_event(encounter, from_state: str, to_state: str, user, notes: str):
    try:
        from .models import WorkflowEvent
        WorkflowEvent.objects.create(
            encounter=encounter,
            from_state=from_state,
            to_state=to_state,
            transitioned_by=user.id if user else None,
            notes=notes,
        )
    except Exception as exc:
        log.warning("Could not record WorkflowEvent: %s", exc)


def get_available_transitions(encounter) -> list[str]:
    return TRANSITIONS.get(encounter.workflow_status, [])
