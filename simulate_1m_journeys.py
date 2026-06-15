import json
import uuid
import random
import time
from concurrent.futures import ProcessPoolExecutor

# The 3 Core Markov Chain Journey Types
JOURNEY_TYPES = [
    "PRE_HOSPITAL_EMERGENCY",
    "CHRONIC_OUTPATIENT",
    "NETWORK_REFERRAL"
]

def generate_ambulance_journey(patient_id):
    return {
        "patient_id": patient_id,
        "journey_type": "PRE_HOSPITAL_EMERGENCY",
        "duration_hours": round(random.uniform(4.0, 72.0), 1),
        "events": [
            {"state": "AMBULANCE_DISPATCH", "facility": "City EMS", "action": "Telemetry Transmitted"},
            {"state": "ER_ARRIVAL", "facility": "Central Hospital", "action": "Triage (Level 1)"},
            {"state": "STAT_IMAGING", "facility": "Central Hospital Radiology", "action": "CT Scan Head"},
            {"state": "EMERGENCY_SURGERY", "facility": "Central Hospital OR", "action": "Craniotomy"},
            {"state": "ICU_ADMISSION", "facility": "Central Hospital ICU", "action": "Ventilator Support"},
            {"state": "DISCHARGE", "facility": "Central Hospital", "action": "Discharge to Rehab"}
        ]
    }

def generate_outpatient_journey(patient_id):
    return {
        "patient_id": patient_id,
        "journey_type": "CHRONIC_OUTPATIENT",
        "duration_hours": round(random.uniform(1.0, 4.0), 1),
        "events": [
            {"state": "CLINIC_VISIT", "facility": "Northside Clinic", "action": "Cardiology Follow-up"},
            {"state": "E_PRESCRIPTION", "facility": "Northside Clinic", "action": "Atorvastatin 20mg"},
            {"state": "CONSENT_GRANTED", "facility": "Patient Portal", "action": "Granted Pharmacy Access"},
            {"state": "EXTERNAL_DISPENSE", "facility": "Citywide Pharmacy", "action": "Medication Dispensed"}
        ]
    }

def generate_referral_journey(patient_id):
    return {
        "patient_id": patient_id,
        "journey_type": "NETWORK_REFERRAL",
        "duration_hours": round(random.uniform(24.0, 168.0), 1),
        "events": [
            {"state": "CLINIC_VISIT", "facility": "Westside Family Practice", "action": "Knee Pain Consult"},
            {"state": "SPECIALIST_REFERRAL", "facility": "Westside Family Practice", "action": "Orthopedics Order"},
            {"state": "CONSENT_GRANTED", "facility": "Patient Portal", "action": "Granted Imaging Center Access"},
            {"state": "EXTERNAL_IMAGING", "facility": "National Imaging Center", "action": "MRI Right Knee"}
        ]
    }

def generate_batch(batch_size):
    journeys = []
    for _ in range(batch_size):
        patient_id = f"G-MRN-{uuid.uuid4().hex[:16].upper()}"
        j_type = random.choice(JOURNEY_TYPES)
        
        if j_type == "PRE_HOSPITAL_EMERGENCY":
            journeys.append(generate_ambulance_journey(patient_id))
        elif j_type == "CHRONIC_OUTPATIENT":
            journeys.append(generate_outpatient_journey(patient_id))
        else:
            journeys.append(generate_referral_journey(patient_id))
            
    return journeys

def run_simulation(total_records=1000000, output_file="cymed_1m_journeys.jsonl"):
    print(f"Initiating High-Performance Simulation for {total_records} Longitudinal Patient Journeys...")
    start_time = time.time()
    
    batch_size = 50000
    batches = total_records // batch_size
    
    with open(output_file, 'w') as f:
        with ProcessPoolExecutor() as executor:
            # Dispatch all batches to worker pool
            futures = [executor.submit(generate_batch, batch_size) for _ in range(batches)]
            
            processed = 0
            for future in futures:
                batch_data = future.result()
                for record in batch_data:
                    f.write(json.dumps(record) + "\n")
                processed += batch_size
                print(f"  -> Generated {processed:,} / {total_records:,} journeys...")

    elapsed = time.time() - start_time
    print(f"\nSUCCESS: Data Warehouse Export Complete.")
    print(f"Total Time: {elapsed:.2f} seconds")
    print(f"Output File: {output_file} ({processed:,} records generated)")

if __name__ == "__main__":
    run_simulation(1000000)
