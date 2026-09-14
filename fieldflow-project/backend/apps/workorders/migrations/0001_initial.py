import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [("accounts", "0001_initial"), ("services", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="ServiceRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("description", models.TextField()),
                ("address", models.TextField()),
                ("preferred_start", models.DateTimeField(blank=True, null=True)),
                ("priority", models.PositiveSmallIntegerField(default=2, validators=[django.core.validators.MinValueValidator(1)])),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("REVIEWING", "Reviewing"), ("ASSIGNED", "Assigned"), ("ACCEPTED", "Accepted"), ("SCHEDULED", "Scheduled"), ("IN_PROGRESS", "In progress"), ("COMPLETED", "Completed"), ("VERIFIED", "Verified"), ("CANCELLED", "Cancelled")], default="PENDING", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("customer", models.ForeignKey(limit_choices_to={"role": "CUSTOMER"}, on_delete=django.db.models.deletion.CASCADE, related_name="service_requests", to=settings.AUTH_USER_MODEL)),
                ("service", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="requests", to="services.service")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(model_name="servicerequest", index=models.Index(fields=["customer", "status"], name="workorders__custome_2d63e8_idx")),
        migrations.AddIndex(model_name="servicerequest", index=models.Index(fields=["status", "priority"], name="workorders__status_6cc7ad_idx")),
        migrations.CreateModel(
            name="Assignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("assigned_at", models.DateTimeField(auto_now_add=True)),
                ("accepted_at", models.DateTimeField(blank=True, null=True)),
                ("scheduled_start", models.DateTimeField(blank=True, null=True)),
                ("assigned_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="created_assignments", to=settings.AUTH_USER_MODEL)),
                ("request", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="assignment", to="workorders.servicerequest")),
                ("worker", models.ForeignKey(limit_choices_to={"role": "WORKER"}, on_delete=django.db.models.deletion.PROTECT, related_name="assignments", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="StatusHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("from_status", models.CharField(blank=True, max_length=20)),
                ("to_status", models.CharField(choices=[("PENDING", "Pending"), ("REVIEWING", "Reviewing"), ("ASSIGNED", "Assigned"), ("ACCEPTED", "Accepted"), ("SCHEDULED", "Scheduled"), ("IN_PROGRESS", "In progress"), ("COMPLETED", "Completed"), ("VERIFIED", "Verified"), ("CANCELLED", "Cancelled")], max_length=20)),
                ("note", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("changed_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
                ("request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="status_history", to="workorders.servicerequest")),
            ],
            options={"ordering": ["created_at"]},
        ),
        migrations.CreateModel(
            name="WorkAttachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("proof_url", models.URLField(blank=True, max_length=500)),
                ("label", models.CharField(default="Proof", max_length=80)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attachments", to="workorders.servicerequest")),
                ("uploaded_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="Invoice",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("subtotal", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("discount", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("total", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("payment_status", models.CharField(choices=[("UNPAID", "Unpaid"), ("PENDING", "Pending"), ("PAID", "Paid")], default="UNPAID", max_length=10)),
                ("issued_at", models.DateTimeField(auto_now_add=True)),
                ("request", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="invoice", to="workorders.servicerequest")),
            ],
        ),
        migrations.CreateModel(
            name="InvoiceItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("description", models.CharField(max_length=160)),
                ("quantity", models.PositiveIntegerField(default=1)),
                ("unit_price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("line_total", models.DecimalField(decimal_places=2, max_digits=10)),
                ("invoice", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="workorders.invoice")),
            ],
        ),
    ]
