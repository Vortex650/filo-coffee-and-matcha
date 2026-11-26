from rest_framework.permissions import BasePermission


class IsStaffRole(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "is_staff_role", False))


class IsManagerOrOwner(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.role in ("owner", "manager"))
