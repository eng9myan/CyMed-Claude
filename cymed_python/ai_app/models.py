import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class AIGatewayLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    provider = models.CharField(max_length=50) # OPENAI, GEMINI
    model_name = models.CharField(max_length=50) # gpt-4, gemini-1.5-pro
    intent = models.CharField(max_length=50) # SUMMARY, DIAGNOSIS_SUGGESTION
    user_id = models.UUIDField(null=True, blank=True)
    request_payload = models.JSONField()
    response_payload = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20) # SUCCESS, FAILED
    error_message = models.TextField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_gateway_logs'

class AITokenUsage(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    log = models.OneToOneField(AIGatewayLog, on_delete=models.CASCADE, related_name='token_usage')
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)

    class Meta:
        db_table = 'ai_app_token_usage'

class AIFeedback(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    log = models.ForeignKey(AIGatewayLog, on_delete=models.CASCADE, related_name='feedback')
    user_id = models.UUIDField()
    rating = models.IntegerField() # 1-5 or +1/-1
    comments = models.TextField(null=True, blank=True)
    was_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_feedback'

class AITemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=100, unique=True)
    intent = models.CharField(max_length=50)
    system_prompt = models.TextField()
    user_prompt_template = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ai_app_templates'
