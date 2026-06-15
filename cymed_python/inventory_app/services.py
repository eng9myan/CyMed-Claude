from django.dispatch import receiver
from .models import InventoryBatch, MedicalItem
from cymed_core.events import medication_dispensed, emit_event, inventory_low_stock
import logging

logger = logging.getLogger(__name__)

def deduct_stock(sku: str, quantity: float, facility_id=None):
    """
    Deducts stock using FIFO logic based on expiry_date.
    """
    batches = InventoryBatch.objects.filter(
        item__sku=sku, 
        quantity__gt=0
    ).order_by('expiry_date')
    
    if facility_id:
        batches = batches.filter(facility_id=facility_id)

    remaining_to_deduct = quantity
    
    for batch in batches:
        if remaining_to_deduct <= 0:
            break
            
        if batch.quantity >= remaining_to_deduct:
            batch.quantity -= remaining_to_deduct
            batch.save()
            remaining_to_deduct = 0
        else:
            remaining_to_deduct -= batch.quantity
            batch.quantity = 0
            batch.save()
            
    if remaining_to_deduct > 0:
        logger.warning(f"OUT OF STOCK ALERT: Could not deduct {remaining_to_deduct} of {sku}")
        emit_event(inventory_low_stock, sender='inventory_app.services', sku=sku, deficit=remaining_to_deduct)
        return False
        
    return True

@receiver(medication_dispensed)
def handle_medication_dispensed(sender, **kwargs):
    """
    Listens for pharmacy dispenses and deducts inventory.
    """
    medication_sku = kwargs.get('medication_sku')
    quantity = kwargs.get('quantity')
    
    logger.info(f"Inventory Service received Dispense Event for {quantity} of {medication_sku}")
    
    if medication_sku and quantity:
        success = deduct_stock(sku=medication_sku, quantity=quantity)
        if success:
            logger.info(f"Successfully deducted {quantity} of {medication_sku} from inventory.")
