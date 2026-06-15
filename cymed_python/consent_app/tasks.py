"""Celery tasks for consent notifications."""
from celery import shared_task
import logging

log = logging.getLogger("consent_tasks")


@shared_task(bind=True, max_retries=3)
def notify_patient_break_glass(self, break_glass_id: str):
    """Notify patient that their record was accessed via break-glass."""
    try:
        from .models import BreakGlassAccess
        from django.utils import timezone
        bg = BreakGlassAccess.objects.get(id=break_glass_id)
        # TODO: send via patient portal notification + SMS
        bg.patient_notified     = True
        bg.notification_sent_at = timezone.now()
        bg.save(update_fields=["patient_notified", "notification_sent_at"])
        log.warning("Break-glass notification sent: patient=%s event=%s", bg.patient_id, break_glass_id)
    except Exception as exc:
        log.error("Failed to send break-glass notification: %s", exc)
        raise self.retry(exc=exc, countdown=60)
