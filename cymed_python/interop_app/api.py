from ninja import Router
import math
import time
from typing import Dict

router = Router(tags=["IoT Streams"])

@router.get("/iot/stream/{patient_id}")
def stream_vitals(request, patient_id: str) -> Dict:
    """
    Simulates a live bedside monitor stream using sine waves to generate
    fluctuating but realistic human vitals (Heart Rate, SpO2, Blood Pressure).
    """
    
    # Use the current time to drive the sine wave
    current_time = time.time()
    
    # Heart Rate: Base 75 bpm + fluctuation of ±5
    hr_wave = math.sin(current_time) * 5
    heart_rate = round(75 + hr_wave)
    
    # SpO2: Base 98% + fluctuation of ±1
    spo2_wave = math.cos(current_time / 2) * 1
    spo2 = round(98 + spo2_wave)
    if spo2 > 100: spo2 = 100
    
    # Blood Pressure Systolic: Base 120 + fluctuation of ±3
    bp_sys_wave = math.sin(current_time / 3) * 3
    bp_sys = round(120 + bp_sys_wave)
    
    # Blood Pressure Diastolic: Base 80 + fluctuation of ±2
    bp_dia_wave = math.cos(current_time / 3) * 2
    bp_dia = round(80 + bp_dia_wave)
    
    # Temperature: Base 98.6 + fluctuation of ±0.2
    temp_wave = math.sin(current_time / 5) * 0.2
    temp = round(98.6 + temp_wave, 1)

    return {
        "heart_rate": heart_rate,
        "spo2": spo2,
        "blood_pressure": f"{bp_sys}/{bp_dia}",
        "temperature": temp,
        "timestamp": current_time
    }
