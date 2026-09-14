from django.contrib import admin
from .models import Assignment, Invoice, InvoiceItem, ServiceRequest, StatusHistory, WorkAttachment

admin.site.register(ServiceRequest)
admin.site.register(Assignment)
admin.site.register(StatusHistory)
admin.site.register(WorkAttachment)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
