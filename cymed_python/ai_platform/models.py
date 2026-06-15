"""AI usage tracking — cost, latency, provider audit."""
import uuid6
from django.db import models


def gen_uuid(): return uuid6.uuid7()
# Compatibility alias for old migrations that reference generate_uuidv7
generate_uuidv7 = gen_uuid


class AIUsageLog(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    provider     = models.CharField(max_length=20, db_index=True)
    model        = models.CharField(max_length=50)
    use_case     = models.CharField(max_length=80, db_index=True)
    user_id      = models.UUIDField(null=True, blank=True, db_index=True)
    patient_id   = models.UUIDField(null=True, blank=True)
    input_tokens = models.IntegerField(default=0)
    output_tokens= models.IntegerField(default=0)
    cost_usd     = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    latency_ms   = models.IntegerField(default=0)
    error        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "ai_usage_logs"
        indexes  = [
            models.Index(fields=["created_at", "provider"]),
            models.Index(fields=["use_case", "created_at"]),
        ]

    def __str__(self):
        return f"{self.provider}/{self.model} — {self.use_case} — ${self.cost_usd}"
