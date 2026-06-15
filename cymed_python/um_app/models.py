import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class PriorAuthorization(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    procedure_code = models.CharField(max_length=50)
    payer_id = models.UUIDField()
    status = models.CharField(max_length=50, default='PENDING') # PENDING, APPROVED, DENIED
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'um_prior_auths'

class UtilizationReview(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    review_type = models.CharField(max_length=50) # CONCURRENT, RETROSPECTIVE
    findings = models.TextField()
    is_medically_necessary = models.BooleanField(default=True)

    class Meta:
        db_table = 'um_reviews'
