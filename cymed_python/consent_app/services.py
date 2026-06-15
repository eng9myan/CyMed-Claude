"""
Consent Engine — central authority for all patient data access decisions.
"""
from __future__ import annotations

import logging
from typing import Optional
from django.utils import timezone
from .models import ConsentGrant, ConsentScope, ConsentStatus, ConsentAccessLog, BreakGlassAccess

log = logging.getLogger("consent_engine")


def check_access(
    *,
    patient_id,
    requester_id,
    requester_type: str,
    scope: str,
    facility_id=None,
    episode_id=None,
    resource_type: str = "",
    resource_id=None,
    ip_address: str = "",
    log_access: bool = True,
) -> tuple[bool, str]:
    """
    Returns (allowed: bool, reason: str).
    Logs access attempt to ConsentAccessLog if log_access=True.
    """
    now = timezone.now()

    grant = ConsentGrant.objects.filter(
        patient_id=patient_id,
        granted_to_id=requester_id,
        granted_to_type=requester_type,
        status=ConsentStatus.ACTIVE,
    ).filter(
        models_q_valid_until_or_null(now)
    ).first()

    if grant and grant.has_scope(scope):
        if episode_id and grant.episode_id and str(grant.episode_id) != str(episode_id):
            reason = "episode_mismatch"
            allowed = False
        else:
            reason = f"consent_grant:{grant.id}"
            allowed = True
    else:
        # Check for active break-glass covering this patient
        active_bg = BreakGlassAccess.objects.filter(
            patient_id=patient_id,
            accessed_by__id=requester_id,
            access_end__isnull=True,
        ).first()
        if active_bg and scope in active_bg.scopes_accessed:
            reason = f"break_glass:{active_bg.id}"
            allowed = True
        else:
            reason = "no_consent"
            allowed = False

    if log_access:
        ConsentAccessLog.objects.create(
            patient_id=patient_id,
            consent=grant if (allowed and grant) else None,
            accessed_by=requester_id,
            accessed_by_type=requester_type,
            access_type="read",
            resource_type=resource_type,
            resource_id=resource_id,
            scope_used=scope if allowed else "",
            facility_id=facility_id,
            ip_address=ip_address or None,
        )

    if not allowed:
        log.warning("Access denied: patient=%s requester=%s scope=%s reason=%s",
                    patient_id, requester_id, scope, reason)

    return allowed, reason


def models_q_valid_until_or_null(now):
    from django.db.models import Q
    return Q(valid_until__isnull=True) | Q(valid_until__gte=now)


def grant_consent(
    *,
    patient_id,
    granted_by,
    granted_to_type: str,
    granted_to_id,
    granted_to_name: str,
    scopes: list[str],
    purpose: str = "treatment",
    valid_until=None,
    episode_id=None,
    ip_address: str = "",
    patient_signature: str = "",
    notes: str = "",
) -> ConsentGrant:
    grant = ConsentGrant.objects.create(
        patient_id=patient_id,
        granted_by=granted_by,
        granted_to_type=granted_to_type,
        granted_to_id=granted_to_id,
        granted_to_name=granted_to_name,
        scopes=scopes,
        purpose=purpose,
        status=ConsentStatus.ACTIVE,
        valid_until=valid_until,
        episode_id=episode_id,
        ip_address=ip_address or None,
        patient_signature=patient_signature,
        notes=notes,
    )
    log.info("Consent granted: patient=%s → %s:%s scopes=%s", patient_id, granted_to_type, granted_to_id, scopes)
    return grant


def revoke_consent(*, consent_id, revoked_by, reason: str) -> ConsentGrant:
    from .models import ConsentRevocation
    grant = ConsentGrant.objects.get(id=consent_id)
    grant.status = ConsentStatus.REVOKED
    grant.save(update_fields=["status", "updated_at"])
    ConsentRevocation.objects.create(
        consent=grant,
        revoked_by=revoked_by,
        reason=reason,
    )
    log.info("Consent revoked: id=%s by=%s reason=%s", consent_id, revoked_by, reason)
    return grant


def open_break_glass(
    *,
    patient_id,
    user,
    facility_id,
    justification: str,
    notes: str,
    scopes: list[str],
    ip_address: str = "",
) -> BreakGlassAccess:
    if not notes or len(notes.strip()) < 20:
        raise ValueError("Break-glass access requires a detailed justification (min 20 characters).")

    bg = BreakGlassAccess.objects.create(
        patient_id=patient_id,
        accessed_by=user,
        facility_id=facility_id,
        justification=justification,
        notes=notes,
        scopes_accessed=scopes,
        ip_address=ip_address or None,
    )
    # Notify patient asynchronously
    from .tasks import notify_patient_break_glass
    notify_patient_break_glass.delay(str(bg.id))
    log.warning("BREAK-GLASS OPENED: patient=%s by=%s justification=%s", patient_id, user.id, justification)
    return bg


def close_break_glass(*, break_glass_id):
    bg = BreakGlassAccess.objects.get(id=break_glass_id)
    if bg.access_end is None:
        bg.access_end = timezone.now()
        bg.save(update_fields=["access_end"])
    return bg
