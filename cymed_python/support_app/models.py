import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class SupportTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    tenant_id = models.UUIDField()
    reporter_id = models.UUIDField()
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50, default='OPEN') # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority = models.CharField(max_length=50, default='NORMAL') # LOW, NORMAL, HIGH, URGENT
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'support_tickets'
