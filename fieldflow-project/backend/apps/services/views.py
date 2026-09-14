from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Service, WorkerSkill
from .serializers import ServiceSerializer, WorkerSkillSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Service.objects.select_related("owner")

        if user.role == "OWNER":
            return qs.filter(owner=user)

        return qs.filter(active=True)

    def perform_create(self, serializer):
        self.check_role()
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        self.check_role()

        service = self.get_object()

        if service.owner_id != self.request.user.id:
            raise PermissionDenied(
                "Only the service owner can edit this service."
            )

        serializer.save()

    def perform_destroy(self, instance):
        self.check_role()

        if instance.owner_id != self.request.user.id:
            raise PermissionDenied(
                "Only the service owner can delete this service."
            )

        instance.delete()

    def check_role(self):
        if self.request.user.role != "OWNER":
            raise PermissionDenied(
                "Only business owners can manage services."
            )


class WorkerSkillViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Workers see/manage their own skills.
        if user.role == "WORKER":
            return WorkerSkill.objects.filter(worker=user)

        # Owners/admins can view skills.
        return WorkerSkill.objects.select_related("worker").all()

    def perform_create(self, serializer):
        if self.request.user.role != "WORKER":
            raise PermissionDenied(
                "Only workers can add skills."
            )

        serializer.save(worker=self.request.user)

    def perform_update(self, serializer):
        skill = self.get_object()

        if skill.worker_id != self.request.user.id:
            raise PermissionDenied(
                "You can only edit your own skills."
            )

        serializer.save()

    def perform_destroy(self, instance):
        if instance.worker_id != self.request.user.id:
            raise PermissionDenied(
                "You can only delete your own skills."
            )

        instance.delete()