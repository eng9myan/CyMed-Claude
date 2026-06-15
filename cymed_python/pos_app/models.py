import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class POSRegister(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    current_cash = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, default='Closed')
    assigned_cashier_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_pos_registers'

class POSOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    register = models.ForeignKey(POSRegister, on_delete=models.CASCADE)
    cashier_id = models.UUIDField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_pos_orders'
