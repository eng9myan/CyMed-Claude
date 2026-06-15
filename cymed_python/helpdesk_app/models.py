import random
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class HelpdeskTicket(models.Model):
    ticket_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    priority = models.CharField(max_length=100, blank=True, null=True)
    category_id = models.IntegerField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_helpdesk_tickets')
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            while True:
                new_id = str(random.randint(10000000, 99999999))
                if not HelpdeskTicket.objects.filter(ticket_id=new_id).exists():
                    self.ticket_id = new_id
                    break
        super().save(*args, **kwargs)

class Notification(models.Model):
    module = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    action = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    permissions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class EmailTemplate(models.Model):
    name = models.CharField(max_length=255)
    from_email = models.CharField(max_length=255, blank=True, null=True, db_column='from')
    module_name = models.CharField(max_length=255, blank=True, null=True)
    creator_id = models.IntegerField(null=True, blank=True)
    created_by = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Compatibility alias for legacy migrations
import uuid6 as _uuid6
def generate_uuidv7(): return _uuid6.uuid7()
