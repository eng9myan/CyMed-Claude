import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class Ward(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    facility_id = models.UUIDField(null=True, blank=True)
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100) # e.g. Cardiology, General Med
    ward_type = models.CharField(max_length=50) # ICU, GENERAL, MATERNITY
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'bed_wards'

class Bed(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds', null=True)
    bed_number = models.CharField(max_length=50)
    status = models.CharField(max_length=50) # AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE
    equipment_level = models.CharField(max_length=50) # BASIC, TELEMETRY, VENTILATOR
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'beds'

class BedAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    bed = models.ForeignKey(Bed, on_delete=models.CASCADE, related_name='assignments')
    encounter_id = models.UUIDField()
    patient_id = models.UUIDField(null=True, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    released_at = models.DateTimeField(null=True, blank=True)
    assigned_by = models.UUIDField()

    class Meta:
        db_table = 'bed_assignments'

class DailyCapacitySnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE)
    snapshot_date = models.DateField(auto_now_add=True)
    total_beds = models.IntegerField()
    occupied_beds = models.IntegerField()
    available_beds = models.IntegerField()

    class Meta:
        db_table = 'bed_capacity_snapshots'

class SurgeCapacityPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE)
    trigger_threshold_percent = models.IntegerField()
    additional_beds_possible = models.IntegerField()
    action_plan = models.TextField()

    class Meta:
        db_table = 'bed_surge_plans'
