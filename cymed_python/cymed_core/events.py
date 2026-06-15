from django.dispatch import Signal
import logging

logger = logging.getLogger(__name__)

# Core Business Events Registry

# Pharmacy Events
medication_dispensed = Signal()
medication_returned = Signal()
inventory_low_stock = Signal()

# Clinical Events
patient_registered = Signal()
encounter_completed = Signal()
patient_admitted = Signal()
patient_discharged = Signal()
medication_ordered = Signal()

# Billing Events
charge_generated = Signal()

# Diagnostic Events
lab_ordered = Signal()
radiology_ordered = Signal()
lab_result_published = Signal()

def emit_event(signal, sender, **kwargs):
    """
    Standardized event emitter wrapper to ensure robust cross-app communication.
    Uses robust dispatching so one app's error doesn't crash the transaction.
    """
    logger.info(f"EMITTING EVENT: {signal} from {sender}")
    try:
        # send_robust catches exceptions from receivers so one bad receiver 
        # doesn't crash the publisher (crucial for Modular Licensing)
        responses = signal.send_robust(sender=sender, **kwargs)
        for receiver, response in responses:
            if isinstance(response, Exception):
                logger.error(f"Event Receiver Error: {receiver} failed with {response}")
    except Exception as e:
        logger.error(f"Event Dispatch Error: {e}")
