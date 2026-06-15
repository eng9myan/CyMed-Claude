import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    from_id = models.UUIDField(db_index=True)
    to_id = models.UUIDField(db_index=True)
    body = models.TextField(null=True, blank=True)
    attachment = models.CharField(max_length=500, null=True, blank=True)
    seen = models.BooleanField(default=False)
    deleted_by_sender = models.BooleanField(default=False)
    deleted_by_receiver = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_chat_messages'

class ChatFavorite(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    user_id = models.UUIDField(db_index=True)
    favorite_id = models.UUIDField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cymed_chat_favorites'
