import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from rpm_app.services import RPMIngestionService

print("Testing RPM Service...")
service = RPMIngestionService()
service.process_reading("SN-WATCH-1", "HEART_RATE", 130) # Critical Alert
service.process_reading("SN-WATCH-1", "SPO2", 90) # Warning Alert
service.process_reading("SN-WATCH-1", "GLUCOSE", 110) # Normal

from rpm_app.models import RPMAlert
alerts = RPMAlert.objects.all()
print(f"Total Alerts Generated: {len(alerts)}")
