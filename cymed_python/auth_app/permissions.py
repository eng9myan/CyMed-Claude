"""
CyMed Role-Based Access Control + Facility-Scoped Permissions.
Roles cascade: SuperAdmin > Ministry > Admin > Doctor > Nurse > Pharmacist > LabTech > Receptionist > Patient
"""
from __future__ import annotations
from rest_framework.permissions import BasePermission

# ── Role constants ─────────────────────────────────────────────────────────────
SUPER_ADMIN  = "super_admin"
ADMIN        = "admin"
MINISTRY     = "ministry"
DOCTOR       = "doctor"
NURSE        = "nurse"
PHARMACIST   = "pharmacist"
LAB_TECH     = "lab_tech"
RADIOLOGIST  = "radiologist"
RECEPTIONIST = "receptionist"
BILLING      = "billing"
PATIENT      = "patient"
AUDITOR      = "auditor"

ROLE_HIERARCHY = {
    SUPER_ADMIN:  100,
    MINISTRY:      90,
    ADMIN:         80,
    DOCTOR:        70,
    NURSE:         60,
    PHARMACIST:    55,
    LAB_TECH:      50,
    RADIOLOGIST:   50,
    RECEPTIONIST:  40,
    BILLING:       40,
    AUDITOR:       35,
    PATIENT:       10,
}


def user_role(request) -> str:
    if not request.user or not request.user.is_authenticated:
        return ""
    profile = getattr(request.user, "profile", None)
    if profile:
        return getattr(profile, "role", "")
    groups = list(request.user.groups.values_list("name", flat=True))
    return groups[0] if groups else ""


def user_facility_ids(request) -> list:
    profile = getattr(request.user, "profile", None)
    if not profile:
        return []
    return list(getattr(profile, "facility_ids", []) or [])


def has_role(request, *roles: str) -> bool:
    return user_role(request) in roles


def has_min_role(request, min_role: str) -> bool:
    level     = ROLE_HIERARCHY.get(user_role(request), 0)
    min_level = ROLE_HIERARCHY.get(min_role, 999)
    return level >= min_level


def facility_scoped(request, facility_id) -> bool:
    role = user_role(request)
    if role in (SUPER_ADMIN, MINISTRY):
        return True
    return str(facility_id) in [str(f) for f in user_facility_ids(request)]


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, SUPER_ADMIN)


class IsAdminOrAbove(BasePermission):
    def has_permission(self, request, view):
        return has_min_role(request, ADMIN)


class IsClinical(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, SUPER_ADMIN, ADMIN, DOCTOR, NURSE)


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, DOCTOR, SUPER_ADMIN, ADMIN)


class IsNurse(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, NURSE, DOCTOR, SUPER_ADMIN, ADMIN)


class IsPharmacist(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, PHARMACIST, SUPER_ADMIN, ADMIN)


class IsLabTech(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, LAB_TECH, DOCTOR, SUPER_ADMIN, ADMIN)


class IsRadiologist(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, RADIOLOGIST, DOCTOR, SUPER_ADMIN, ADMIN)


class IsBilling(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, BILLING, SUPER_ADMIN, ADMIN)


class IsFacilityScoped(BasePermission):
    def has_permission(self, request, view):
        fid = (request.data.get("facility_id") or
               request.query_params.get("facility_id"))
        if not fid:
            return True
        return facility_scoped(request, fid)


class IsPatientOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        profile    = getattr(request.user, "profile", None)
        if not profile:
            return False
        patient_id = getattr(profile, "patient_id", None)
        obj_pid    = getattr(obj, "patient_id", None)
        if patient_id and obj_pid and str(patient_id) == str(obj_pid):
            return True
        from consent_app.models import AuthorizedRepresentative
        return AuthorizedRepresentative.objects.filter(
            patient_id=obj_pid,
            representative_user=request.user,
            active=True,
        ).exists()
