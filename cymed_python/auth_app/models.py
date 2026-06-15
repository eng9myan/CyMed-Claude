import uuid6
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

def generate_uuidv7():
    return uuid6.uuid7()

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, help_text="Hospital, Clinic, Ministry")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'auth_organizations'

class Facility(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='facilities')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, help_text="Main Campus, Branch, Lab")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'auth_facilities'

class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    name = models.CharField(max_length=100) # e.g. Nurse, Pharmacist, SuperAdmin
    permissions_json = models.JSONField(default=dict, help_text="Granular JSON permissions")
    
    class Meta:
        db_table = 'auth_roles'

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    # The 'role' and 'facility_id' fields are kept for backward compatibility with existing migrations.
    # The real source of truth will now be the UserAssignment table.
    role = models.CharField(max_length=50, blank=True, null=True, help_text="Legacy role field")
    facility_id = models.UUIDField(blank=True, null=True, help_text="Legacy facility field")
    
    def __str__(self):
        return self.username

class UserAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuidv7, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE)
    department_id = models.UUIDField(help_text="UUID generic link to hr_app.Department")
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'auth_user_assignments'
