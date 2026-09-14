from rest_framework.permissions import BasePermission

class IsRole(BasePermission):
    allowed_roles: set[str] = set()

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)

class IsOwner(IsRole):
    allowed_roles = {"OWNER"}

class IsWorker(IsRole):
    allowed_roles = {"WORKER"}

class IsCustomer(IsRole):
    allowed_roles = {"CUSTOMER"}

class IsOwnerOrWorker(IsRole):
    allowed_roles = {"OWNER", "WORKER"}
