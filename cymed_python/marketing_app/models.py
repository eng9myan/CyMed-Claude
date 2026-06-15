import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class EmailCampaign(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    from_email = models.CharField(max_length=255)
    from_name = models.CharField(max_length=255)
    html_template = models.TextField()
    text_template = models.TextField(null=True, blank=True)
    target_module = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50, default='Draft')
    created_by = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_email_campaigns'
