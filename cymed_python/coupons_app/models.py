import uuid6
from django.db import models

def generate_uuidv7():
    return uuid6.uuid7()

class Coupon(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    code = models.CharField(max_length=50, unique=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    limit = models.IntegerField(default=1)
    type = models.CharField(max_length=50, choices=[('Percentage', 'Percentage'), ('Fixed', 'Fixed')])
    minimum_spend = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    maximum_spend = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    limit_per_user = models.IntegerField(default=1)
    expiry_date = models.DateTimeField(null=True, blank=True)
    included_module = models.JSONField(default=list, blank=True)
    excluded_module = models.JSONField(default=list, blank=True)
    status = models.BooleanField(default=True)
    created_by = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cymed_coupons'

class UserCoupon(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    user_id = models.UUIDField(db_index=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)
    order_id = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'cymed_user_coupons'
