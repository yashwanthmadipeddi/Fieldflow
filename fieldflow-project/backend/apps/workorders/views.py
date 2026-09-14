from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from apps.accounts.models import User
from apps.accounts.permissions import IsOwner, IsOwnerOrWorker
from .models import Assignment, Invoice, ServiceRequest, WorkAttachment
from .serializers import AssignmentCreateSerializer, AssignmentSerializer, InvoiceSerializer, ServiceRequestSerializer, StatusUpdateSerializer, AttachmentSerializer
from .services import assign_worker, change_status, recommend_workers

class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = ServiceRequest.objects.select_related("customer", "service", "assignment__worker").prefetch_related("status_history__changed_by", "attachments__uploaded_by", "invoice")
        if u.role == User.Role.CUSTOMER:
            return qs.filter(customer=u)
        if u.role == User.Role.WORKER:
            return qs.filter(assignment__worker=u)
        return qs.filter(service__owner=u)

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.CUSTOMER:
            raise PermissionDenied("Only customers can create service requests.")
        obj = serializer.save(customer=self.request.user)
        from .models import StatusHistory
        StatusHistory.objects.create(request=obj, from_status="", to_status=obj.status, changed_by=self.request.user, note="Request created")

    @action(detail=True, methods=["post"], url_path="status")
    def update_status(self, request, pk=None):
        obj = self.get_object()
        if request.user.role == User.Role.CUSTOMER and obj.customer_id != request.user.id:
            raise PermissionDenied("Not allowed.")
        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_status(obj, serializer.validated_data["status"], request.user, serializer.validated_data.get("note", ""))
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["get"], url_path="recommend-workers", permission_classes=[IsOwner])
    def recommend(self, request, pk=None):
        obj = self.get_object()
        if obj.service.owner_id != request.user.id:
            raise PermissionDenied("Not allowed.")
        return Response(recommend_workers(obj))

class AssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsOwnerOrWorker]

    def get_queryset(self):
        u = self.request.user
        if u.role == User.Role.WORKER:
            return Assignment.objects.filter(worker=u).select_related("request", "worker", "assigned_by")
        return Assignment.objects.filter(request__service__owner=u).select_related("request", "worker", "assigned_by")

    @action(detail=False, methods=["post"], permission_classes=[IsOwner])
    def assign(self, request):
        serializer = AssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = assign_worker(serializer.validated_data["request"], serializer.validated_data["worker"], request.user, serializer.validated_data.get("scheduled_start"))
        return Response(AssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = Invoice.objects.select_related("request", "request__customer", "request__service").prefetch_related("items")
        if u.role == User.Role.CUSTOMER:
            return qs.filter(request__customer=u)
        if u.role == User.Role.WORKER:
            return qs.filter(request__assignment__worker=u)
        return qs.filter(request__service__owner=u)

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.OWNER:
            raise PermissionDenied("Only owners can issue invoices.")
        request_obj = serializer.validated_data["request"]
        if request_obj.service.owner_id != self.request.user.id:
            raise PermissionDenied("You do not own this request.")
        if request_obj.status not in {request_obj.Status.COMPLETED, request_obj.Status.VERIFIED}:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Invoices can only be issued after work is completed.")
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role != User.Role.OWNER:
            raise PermissionDenied("Only owners can update invoices.")
        if serializer.instance.request.service.owner_id != self.request.user.id:
            raise PermissionDenied("You do not own this invoice.")
        serializer.save()

class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = WorkAttachment.objects.select_related("request", "uploaded_by")
        if u.role == User.Role.CUSTOMER:
            return qs.filter(request__customer=u)
        if u.role == User.Role.WORKER:
            return qs.filter(request__assignment__worker=u)
        return qs.filter(request__service__owner=u)

    def perform_create(self, serializer):
        request_id = self.request.data.get("request")
        obj = ServiceRequest.objects.filter(id=request_id).first()
        if not obj or not self.get_queryset().filter(request=obj).exists():
            raise PermissionDenied("You cannot attach files to this request.")
        serializer.save(uploaded_by=self.request.user, request=obj)
