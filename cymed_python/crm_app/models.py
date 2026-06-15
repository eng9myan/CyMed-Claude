"""Patient Relations & CRM — referrals, satisfaction, outreach."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class PatientSatisfactionSurvey(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    encounter_id = models.UUIDField(null=True, blank=True)
    survey_type  = models.CharField(max_length=30, choices=[
        ("hcahps","HCAHPS"),("outpatient","Outpatient"),("ed","Emergency"),("discharge","Discharge"),
    ])
    overall_score= models.IntegerField(null=True, blank=True, help_text="0-10")
    responses    = models.JSONField(default=dict)
    nps_score    = models.IntegerField(null=True, blank=True)
    comments     = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "crm_satisfaction_surveys"


class Referral(models.Model):
    STATUS = [("pending","Pending"),("accepted","Accepted"),("declined","Declined"),("completed","Completed")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    referring_provider = models.UUIDField()
    receiving_provider = models.UUIDField(null=True, blank=True)
    receiving_facility = models.UUIDField(null=True, blank=True)
    specialty    = models.CharField(max_length=100)
    reason       = models.TextField()
    priority     = models.CharField(max_length=20, choices=[("routine","Routine"),("urgent","Urgent"),("stat","STAT")], default="routine")
    status       = models.CharField(max_length=20, choices=STATUS, default="pending")
    referred_at  = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes        = models.TextField(blank=True)

    class Meta:
        db_table = "crm_referrals"


class PatientOutreach(models.Model):
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    patient_id = models.UUIDField(db_index=True, null=True, blank=True)
    outreach_type= models.CharField(max_length=30, choices=[
        ("followup_call","Follow-up Call"),("appointment_reminder","Appointment Reminder"),
        ("preventive_care","Preventive Care Alert"),("chronic_mgmt","Chronic Disease Management"),
        ("vaccination","Vaccination Reminder"),
    ])
    channel      = models.CharField(max_length=20, choices=[("sms","SMS"),("email","Email"),("call","Phone"),("portal","Portal")])
    message      = models.TextField()
    scheduled_at = models.DateTimeField()
    sent_at      = models.DateTimeField(null=True, blank=True)
    response     = models.CharField(max_length=20, choices=[("pending","Pending"),("delivered","Delivered"),("failed","Failed"),("responded","Responded")], default="pending")

    class Meta:
        db_table = "crm_outreach"
