from django.db import transaction
from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.services.models import Service
from .models import Assignment, Invoice, InvoiceItem, ServiceRequest, StatusHistory, WorkAttachment

User = get_user_model()

class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.get_full_name", read_only=True)
    class Meta:
        model = StatusHistory
        fields = ["id", "from_status", "to_status", "changed_by", "changed_by_name", "note", "created_at"]
        read_only_fields = fields

class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)
    class Meta:
        model = WorkAttachment
        fields = ["id", "proof_url", "label", "uploaded_by", "uploaded_by_name", "created_at"]
        read_only_fields = ["uploaded_by", "uploaded_by_name", "created_at"]

class AssignmentSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source="worker.get_full_name", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.get_full_name", read_only=True)
    class Meta:
        model = Assignment
        fields = ["id", "request", "worker", "worker_name", "assigned_by", "assigned_by_name", "assigned_at", "accepted_at", "scheduled_start"]
        read_only_fields = ["assigned_by", "assigned_by_name", "assigned_at", "accepted_at"]

class ServiceRequestSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.get_full_name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    assignment = AssignmentSerializer(read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    invoice_total = serializers.DecimalField(source="invoice.total", max_digits=10, decimal_places=2, read_only=True, allow_null=True)

    class Meta:
        model = ServiceRequest
        fields = ["id", "customer", "customer_name", "service", "service_name", "description", "address", "preferred_start", "priority", "status", "assignment", "status_history", "attachments", "invoice_total", "created_at", "updated_at"]
        read_only_fields = ["customer", "customer_name", "service_name", "status", "assignment", "status_history", "attachments", "invoice_total", "created_at", "updated_at"]

    def validate_service(self, service):
        if not service.active:
            raise serializers.ValidationError("This service is currently unavailable.")
        return service

class AssignmentCreateSerializer(serializers.Serializer):
    request = serializers.PrimaryKeyRelatedField(queryset=ServiceRequest.objects.all())
    worker = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role="WORKER"))
    scheduled_start = serializers.DateTimeField(required=False, allow_null=True)

class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ServiceRequest.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["id", "description", "quantity", "unit_price", "line_total"]
        read_only_fields = ["line_total"]

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    class Meta:
        model = Invoice
        fields = ["id", "request", "subtotal", "discount", "total", "payment_status", "issued_at", "items"]
        read_only_fields = ["subtotal", "total", "issued_at"]

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        invoice = Invoice.objects.create(**validated_data)
        subtotal = 0
        for item in items_data:
            line_total = item["quantity"] * item["unit_price"]
            InvoiceItem.objects.create(invoice=invoice, line_total=line_total, **item)
            subtotal += line_total
        invoice.subtotal = subtotal
        invoice.total = max(subtotal - invoice.discount, 0)
        invoice.save(update_fields=["subtotal", "total"])
        return invoice
