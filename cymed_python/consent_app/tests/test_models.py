"""Unit tests for consent_app models and services."""
import pytest
from unittest.mock import patch, MagicMock
from django.utils import timezone
from django.test import TestCase

from consent_app.models import (
    ConsentGrant, ConsentScope, ConsentStatus,
    ConsentRevocation, AuthorizedRepresentative, BreakGlassAccess, ConsentAccessLog,
)
from consent_app.services import grant_consent, revoke_consent, check_access, open_break_glass


class TestConsentGrantModel(TestCase):

    def _make_grant(self, **kwargs):
        defaults = dict(
            patient_id=_uuid(),
            granted_by=_uuid(),
            granted_to_type="provider",
            granted_to_id=_uuid(),
            granted_to_name="Dr. Test",
            scopes=["demographics", "medications"],
            purpose="treatment",
            status=ConsentStatus.ACTIVE,
        )
        defaults.update(kwargs)
        return ConsentGrant.objects.create(**defaults)

    def test_has_scope_direct(self):
        g = self._make_grant(scopes=["medications", "laboratory"])
        self.assertTrue(g.has_scope("medications"))
        self.assertFalse(g.has_scope("clinical_notes"))

    def test_has_scope_full_record_grants_all(self):
        g = self._make_grant(scopes=["full_record"])
        self.assertTrue(g.has_scope("clinical_notes"))
        self.assertTrue(g.has_scope("billing"))

    def test_is_valid_active(self):
        g = self._make_grant()
        self.assertTrue(g.is_valid())

    def test_is_valid_revoked(self):
        g = self._make_grant(status=ConsentStatus.REVOKED)
        self.assertFalse(g.is_valid())

    def test_is_valid_expired(self):
        past = timezone.now() - timezone.timedelta(hours=1)
        g = self._make_grant(valid_until=past)
        self.assertFalse(g.is_valid())

    def test_str(self):
        g = self._make_grant()
        self.assertIn("provider", str(g))


class TestConsentGrantService(TestCase):

    def test_grant_consent_creates_record(self):
        pid   = _uuid()
        by    = _uuid()
        to_id = _uuid()
        g = grant_consent(
            patient_id=pid, granted_by=by,
            granted_to_type="facility", granted_to_id=to_id,
            granted_to_name="Test Hospital", scopes=["demographics", "diagnoses"],
        )
        self.assertIsNotNone(g.id)
        self.assertEqual(g.status, ConsentStatus.ACTIVE)
        self.assertEqual(g.patient_id, pid)

    def test_revoke_consent_changes_status(self):
        g = _create_grant()
        revoke_consent(consent_id=g.id, revoked_by=_uuid(), reason="Patient request")
        g.refresh_from_db()
        self.assertEqual(g.status, ConsentStatus.REVOKED)

    def test_revoke_consent_creates_revocation_record(self):
        g = _create_grant()
        revoke_consent(consent_id=g.id, revoked_by=_uuid(), reason="Test revocation")
        self.assertEqual(ConsentRevocation.objects.filter(consent=g).count(), 1)


class TestCheckAccess(TestCase):

    def test_access_allowed_with_valid_grant(self):
        pid      = _uuid()
        provider = _uuid()
        grant_consent(
            patient_id=pid, granted_by=pid,
            granted_to_type="provider", granted_to_id=provider,
            granted_to_name="Dr. X", scopes=["medications"],
        )
        allowed, reason = check_access(
            patient_id=pid, requester_id=provider,
            requester_type="provider", scope="medications",
            log_access=False,
        )
        self.assertTrue(allowed)
        self.assertIn("consent_grant", reason)

    def test_access_denied_no_grant(self):
        allowed, reason = check_access(
            patient_id=_uuid(), requester_id=_uuid(),
            requester_type="provider", scope="clinical_notes",
            log_access=False,
        )
        self.assertFalse(allowed)
        self.assertEqual(reason, "no_consent")

    def test_access_denied_wrong_scope(self):
        pid      = _uuid()
        provider = _uuid()
        grant_consent(
            patient_id=pid, granted_by=pid,
            granted_to_type="provider", granted_to_id=provider,
            granted_to_name="Dr. Y", scopes=["demographics"],
        )
        allowed, reason = check_access(
            patient_id=pid, requester_id=provider,
            requester_type="provider", scope="clinical_notes",
            log_access=False,
        )
        self.assertFalse(allowed)

    def test_access_creates_audit_log(self):
        pid      = _uuid()
        provider = _uuid()
        grant_consent(
            patient_id=pid, granted_by=pid,
            granted_to_type="provider", granted_to_id=provider,
            granted_to_name="Dr. Z", scopes=["full_record"],
        )
        before = ConsentAccessLog.objects.count()
        check_access(
            patient_id=pid, requester_id=provider,
            requester_type="provider", scope="laboratory",
            log_access=True,
        )
        self.assertEqual(ConsentAccessLog.objects.count(), before + 1)


class TestConsentAccessLogImmutability(TestCase):

    def test_cannot_update_audit_log(self):
        pid = _uuid()
        log = ConsentAccessLog.objects.create(
            patient_id=pid, accessed_by=_uuid(),
            accessed_by_type="provider", access_type="read",
            resource_type="Patient",
        )
        log.pk  # force eval
        with self.assertRaises(ValueError):
            log.access_type = "write"
            log.save()


class TestBreakGlassAccess(TestCase):

    @patch("consent_app.tasks.notify_patient_break_glass.delay")
    def test_open_break_glass_creates_record(self, mock_notify):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.create_user(username="er_doc", password="x")
        bg = open_break_glass(
            patient_id=_uuid(), user=user, facility_id=_uuid(),
            justification="unconscious",
            notes="Patient arrived unresponsive, no family present, needs immediate blood transfusion.",
            scopes=["full_record"],
        )
        self.assertIsNotNone(bg.id)
        mock_notify.assert_called_once_with(str(bg.id))

    @patch("consent_app.tasks.notify_patient_break_glass.delay")
    def test_open_break_glass_requires_detailed_notes(self, _):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.create_user(username="er_doc2", password="x")
        with self.assertRaises(ValueError):
            open_break_glass(
                patient_id=_uuid(), user=user, facility_id=_uuid(),
                justification="unconscious", notes="Short.",
                scopes=["full_record"],
            )


# ── Helpers ───────────────────────────────────────────────────────────────────
import uuid as _uuid_module


def _uuid():
    return _uuid_module.uuid4()


def _create_grant(**kwargs):
    pid   = _uuid()
    to_id = _uuid()
    defaults = dict(
        patient_id=pid, granted_by=pid,
        granted_to_type="provider", granted_to_id=to_id,
        granted_to_name="Dr. Test", scopes=["medications"],
    )
    defaults.update(kwargs)
    return grant_consent(**defaults)
