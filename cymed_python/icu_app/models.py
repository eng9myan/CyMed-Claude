import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class IcuFlowsheet(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    recorded_by = models.UUIDField()
    vent_mode = models.CharField(max_length=50, null=True, blank=True)
    fio2 = models.FloatField(null=True, blank=True)
    peep = models.FloatField(null=True, blank=True)
    gcs_score = models.IntegerField(null=True, blank=True)
    rass_score = models.IntegerField(null=True, blank=True)
    pupil_response = models.CharField(max_length=50, null=True, blank=True)
    drips = models.JSONField(help_text="Active vasopressors/sedation drips and rates")
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'icu_flowsheets'

class VentilatorSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.UUIDField()
    vent_mode = models.CharField(max_length=50)
    fio2 = models.FloatField()
    peep = models.FloatField()
    tidal_volume = models.FloatField(null=True, blank=True)
    resp_rate = models.FloatField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'icu_ventilator_settings'

class ContinuousVitals(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    heart_rate = models.FloatField(null=True, blank=True)
    systolic_bp = models.FloatField(null=True, blank=True)
    diastolic_bp = models.FloatField(null=True, blank=True)
    map = models.FloatField(null=True, blank=True)
    spo2 = models.FloatField(null=True, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    respiratory_rate = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'icu_continuous_vitals'

class GCS(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.UUIDField()
    eye_opening = models.IntegerField()
    verbal_response = models.IntegerField()
    motor_response = models.IntegerField()
    total_score = models.IntegerField()

    class Meta:
        db_table = 'icu_gcs'

class SOFAScore(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    encounter_id = models.UUIDField()
    calculated_at = models.DateTimeField(auto_now_add=True)
    respiration_score = models.IntegerField(default=0)
    coagulation_score = models.IntegerField(default=0)
    liver_score = models.IntegerField(default=0)
    cardiovascular_score = models.IntegerField(default=0)
    cns_score = models.IntegerField(default=0)
    renal_score = models.IntegerField(default=0)
    total_score = models.IntegerField()

    class Meta:
        db_table = 'icu_sofa_score'
