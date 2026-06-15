"""JWT auth endpoints — simplejwt tokens with facility-scoped custom claims."""
from __future__ import annotations
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate, get_user_model

from .models import UserAssignment

User = get_user_model()


def _assignments(user) -> list[UserAssignment]:
    return list(
        UserAssignment.objects
        .filter(user=user, is_active=True)
        .select_related("facility", "role")
    )


def _token_for_user(user) -> RefreshToken:
    assignments = _assignments(user)
    token = RefreshToken.for_user(user)
    primary = next((a for a in assignments if a.is_primary), assignments[0] if assignments else None)
    token["role"]         = primary.role.name if primary else ""
    token["facility_ids"] = [str(a.facility_id) for a in assignments]
    token["facility_id"]  = str(primary.facility_id) if primary else ""
    return token


def _user_payload(user, assignments: list[UserAssignment]) -> dict:
    primary = next((a for a in assignments if a.is_primary), assignments[0] if assignments else None)
    return {
        "id":           str(user.id),
        "email":        user.email,
        "name":         user.get_full_name(),
        "role":         primary.role.name if primary else "",
        "facility_id":  str(primary.facility_id) if primary else "",
        "facility_ids": [str(a.facility_id) for a in assignments],
    }


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    email    = request.data.get("email", "")
    password = request.data.get("password", "")
    user     = authenticate(request, username=email, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({"error": "Account disabled"}, status=status.HTTP_403_FORBIDDEN)

    refresh     = _token_for_user(user)
    assignments = _assignments(user)
    _log_auth_event(user, request, "login")

    return Response({
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
        "user":    _user_payload(user, assignments),
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    token_str = request.data.get("refresh", "")
    try:
        old = RefreshToken(token_str)
        user = User.objects.get(id=old["user_id"])
    except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
        return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    new = _token_for_user(user)
    return Response({"access": str(new.access_token), "refresh": str(new)})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        token = RefreshToken(request.data.get("refresh", ""))
        token.blacklist()
    except Exception:
        pass
    _log_auth_event(request.user, request, "logout")
    return Response({"detail": "Logged out"})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    user        = request.user
    assignments = _assignments(user)
    return Response(_user_payload(user, assignments))


def _log_auth_event(user, request, event_type: str):
    try:
        from audit_log_app.models import AuditLog
        AuditLog.objects.create(
            user_id=user.id,
            event_type=f"auth:{event_type}",
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        )
    except Exception:
        pass
