"""Local ICD-11 code cache — populated by the WHO API sync job."""
import uuid6
from django.db import models


def gen_uuid():
    return uuid6.uuid7()


class ICD11Code(models.Model):
    id              = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    code            = models.CharField(max_length=20, unique=True, db_index=True)
    title           = models.CharField(max_length=500)
    title_ar        = models.CharField(max_length=500, blank=True)
    definition      = models.TextField(blank=True)
    # Hierarchy
    parent_code     = models.CharField(max_length=20, blank=True, db_index=True)
    chapter         = models.CharField(max_length=10, blank=True)
    block_title     = models.CharField(max_length=255, blank=True)
    # Legacy mapping
    icd10_codes     = models.JSONField(default=list, help_text="Mapped ICD-10 codes")
    # Classification
    is_billable     = models.BooleanField(default=True)
    is_residual     = models.BooleanField(default=False)
    # WHO API
    who_uri         = models.URLField(max_length=500, blank=True)
    who_foundation_uri = models.URLField(max_length=500, blank=True)
    # Search
    search_terms    = models.TextField(blank=True, help_text="Extra tokens for full-text search")
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "icd11_codes"
        indexes  = [
            models.Index(fields=["chapter"]),
            models.Index(fields=["is_billable"]),
        ]

    def __str__(self):
        return f"{self.code} — {self.title}"


class ICD11SyncLog(models.Model):
    id         = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at   = models.DateTimeField(null=True, blank=True)
    codes_synced = models.IntegerField(default=0)
    status     = models.CharField(max_length=20, choices=[
        ("running", "Running"),
        ("success", "Success"),
        ("failed",  "Failed"),
    ], default="running")
    error      = models.TextField(blank=True)

    class Meta:
        db_table = "icd11_sync_logs"
