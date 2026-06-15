from celery import shared_task
from .models import Hl7MessageLog

def simple_hl7_parse(raw_message):
    segments = raw_message.strip().split('\r')
    if len(segments) == 1 and '\n' in segments[0]:
        segments = raw_message.strip().split('\n')
        
    parsed = {}
    for segment in segments:
        fields = segment.split('|')
        if not fields:
            continue
        segment_type = fields[0]
        parsed[segment_type] = fields
    return parsed

@shared_task
def parse_incoming_hl7_message(raw_message_text, source_system="EXTERNAL"):
    """
    Background job to parse HL7 v2 messages (e.g. ADT, ORU) and route them 
    to the respective Django domains (Patient, Lab).
    """
    msg_log = Hl7MessageLog.objects.create(
        raw_message=raw_message_text,
        source_system=source_system,
        processing_status="RECEIVED"
    )
    
    try:
        parsed_message = simple_hl7_parse(raw_message_text)
        
        msh_segment = parsed_message.get('MSH')
        if msh_segment and len(msh_segment) > 8:
            message_type_comp = msh_segment[8].split('^')
            message_type = message_type_comp[0] if message_type_comp else msh_segment[8]
            
            if message_type == 'ADT':
                # Map PID segment
                pid = parsed_message.get('PID')
                if pid and len(pid) > 5:
                    patient_id = pid[3]
                    patient_name = pid[5].replace('^', ' ').strip()
                    dob = pid[7] if len(pid) > 7 else None
                    gender = pid[8] if len(pid) > 8 else None
                    
                    print(f"[HL7 Engine] ADT Processed: Patient {patient_name} (ID: {patient_id}) mapped.")
                    # In full implementation: Patient.objects.update_or_create(...)
                    
                # Map PV1 segment
                pv1 = parsed_message.get('PV1')
                if pv1 and len(pv1) > 3:
                    location = pv1[3]
                    print(f"[HL7 Engine] ADT Encounter mapped to Location: {location}")
                    # In full implementation: Encounter.objects.create(...)
                    
            elif message_type == 'ORU':
                print("[HL7 Engine] ORU Message Received. Result routing initiated.")
                pass
        
        msg_log.processing_status = "PROCESSED"
        msg_log.save()
        return {"status": "success", "log_id": str(msg_log.id)}
    except Exception as e:
        msg_log.processing_status = "ERROR"
        msg_log.error_message = str(e)
        msg_log.save()
        return {"status": "error", "message": str(e)}
