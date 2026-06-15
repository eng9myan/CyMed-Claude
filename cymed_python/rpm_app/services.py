from datetime import datetime
from .models import ConnectedDevice, DeviceReading, RPMAlert
import uuid

class RPMIngestionService:
    def process_reading(self, device_sn: str, metric: str, value: float):
        """
        Process incoming webhook/MQTT from Apple Watch / CGM.
        """
        device = ConnectedDevice.objects.filter(serial_number=device_sn, is_active=True).first()
        if not device:
            # Auto-enroll for mock purposes
            device = ConnectedDevice.objects.create(
                patient_id=uuid.uuid4(),
                device_type="GENERIC_IOT",
                serial_number=device_sn
            )

        reading = DeviceReading.objects.create(
            device=device,
            metric_type=metric,
            value=value,
            recorded_at=datetime.now()
        )
        
        # Rule Engine Trigger
        alert_level = None
        if metric == "HEART_RATE" and (value > 120 or value < 40):
            alert_level = "CRITICAL"
        elif metric == "GLUCOSE" and (value < 70 or value > 250):
            alert_level = "CRITICAL"
        elif metric == "SPO2" and value < 92:
            alert_level = "WARNING"
            
        if alert_level:
            alert = RPMAlert.objects.create(
                patient_id=device.patient_id,
                reading=reading,
                alert_level=alert_level
            )
            print(f"[RPM Alert] {alert_level} generated for patient {device.patient_id} - {metric}: {value}")
            return alert
        
        return reading
