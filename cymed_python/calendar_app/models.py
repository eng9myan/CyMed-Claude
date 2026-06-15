import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class CalendarEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, null=True, blank=True)
    organizer_id = models.UUIDField(db_index=True)
    is_all_day = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='Confirmed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_calendar_events'
