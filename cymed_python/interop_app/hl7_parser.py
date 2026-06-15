from .models import InteropMessageLog

class HL7Parser:
    @staticmethod
    def parse_message(raw_hl7):
        # Extremely simplified mock parser
        segments = raw_hl7.strip().split('\n')
        parsed_data = {}
        msg_type = "UNKNOWN"
        
        for segment in segments:
            fields = segment.split('|')
            if fields[0] == 'MSH':
                msg_type = fields[8]
                parsed_data['MSH'] = fields
            elif fields[0] == 'PID':
                parsed_data['PID'] = fields
            elif fields[0] == 'PV1':
                parsed_data['PV1'] = fields
                
        # Log the message
        log = InteropMessageLog.objects.create(
            message_type='HL7',
            event_type=msg_type,
            direction='INBOUND',
            source_system='EXTERNAL_ADT',
            target_system='CYMED_CORE',
            raw_payload=raw_hl7,
            parsed_payload=parsed_data,
            status='PROCESSED'
        )
        return log, parsed_data

class HL7Generator:
    @staticmethod
    def generate_adt_a01(patient):
        msh = f"MSH|^~\\&|CYMED_CORE|CYMED_FACILITY|EXTERNAL_SYSTEM|EXTERNAL_FACILITY|||ADT^A01|{patient.id}|P|2.4"
        pid = f"PID|1||{patient.id}^^^CYMED^MR||{patient.last_name}^{patient.first_name}|||||||||||||||||||||||"
        return f"{msh}\n{pid}"
