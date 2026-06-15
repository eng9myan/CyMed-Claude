import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class ConnectedDevice(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    device_type = models.CharField(max_length=100) # APPLE_WATCH, CONTINUOUS_GLUCOSE_MONITOR
    serial_number = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'rpm_devices'

class DeviceReading(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    device = models.ForeignKey(ConnectedDevice, on_delete=models.CASCADE)
    metric_type = models.CharField(max_length=50) # HEART_RATE, GLUCOSE, SPO2
    value = models.DecimalField(max_digits=10, decimal_places=2)
    recorded_at = models.DateTimeField()

    class Meta:
        db_table = 'rpm_readings'

class RPMAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    patient_id = models.UUIDField(null=True, blank=True)
    reading = models.ForeignKey(DeviceReading, on_delete=models.CASCADE)
    alert_level = models.CharField(max_length=50) # WARNING, CRITICAL
    status = models.CharField(max_length=50, default='NEW') # NEW, ACKNOWLEDGED, RESOLVED

    class Meta:
        db_table = 'rpm_alerts'
