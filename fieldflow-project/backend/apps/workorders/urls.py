from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, AttachmentViewSet, InvoiceViewSet, ServiceRequestViewSet

router = DefaultRouter()
router.register("requests", ServiceRequestViewSet, basename="service-request")
router.register("assignments", AssignmentViewSet, basename="assignment")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("attachments", AttachmentViewSet, basename="attachment")

urlpatterns = [path("", include(router.urls))]
