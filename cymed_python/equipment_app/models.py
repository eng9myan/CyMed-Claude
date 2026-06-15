import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class MedicalEquipment(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    equipment_type = models.CharField(max_length=100) # VENTILATOR, INFUSION_PUMP, DEFIBRILLATOR
    serial_number = models.CharField(max_length=100, unique=True)
    manufacturer = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    facility_id = models.UUIDField(null=True, blank=True)
    current_location = models.CharField(max_length=255) # or reference to RTLS
    status = models.CharField(max_length=50) # IN_USE, AVAILABLE, MAINTENANCE, RETIRED
    next_maintenance_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'equip_assets'

class MaintenanceLog(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    equipment = models.ForeignKey(MedicalEquipment, on_delete=models.CASCADE, related_name='maintenance_logs')
    performed_by = models.UUIDField()
    maintenance_type = models.CharField(max_length=50) # ROUTINE, REPAIR
    notes = models.TextField()
    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'equip_maintenance_logs'
