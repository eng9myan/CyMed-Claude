import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cymed_core.settings')
django.setup()

from hl7_engine.tasks import parse_incoming_hl7_message
from hl7_engine.models import Hl7MessageLog

hl7_adt = """MSH|^~\\&|SENDING_APP|SENDING_FAC|CYMED|CYMED_FAC|202606110000||ADT^A01|MSG123|P|2.5
PID|1||MRN12345||DOE^JOHN||19800101|M
PV1|1|I|ICU^BED1^^CYMED_FAC"""

print("Simulating Incoming ADT A01 Message...")
result = parse_incoming_hl7_message(hl7_adt)
print(f"Result: {result}")

log = Hl7MessageLog.objects.get(id=result['log_id'])
print(f"Logged Status: {log.status}")
