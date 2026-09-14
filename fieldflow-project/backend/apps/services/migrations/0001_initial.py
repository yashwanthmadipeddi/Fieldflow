import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = [("accounts", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Service",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                ("base_price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("estimated_minutes", models.PositiveIntegerField(default=60)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="services", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(model_name="service", index=models.Index(fields=["owner", "active"], name="services_se_owner_i_6c8a9e_idx")),
        migrations.AddIndex(model_name="service", index=models.Index(fields=["name"], name="services_se_name_1c2d8d_idx")),
        migrations.CreateModel(
            name="WorkerSkill",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=80)),
                ("level", models.PositiveSmallIntegerField(default=1)),
                ("worker", models.ForeignKey(limit_choices_to={"role": "WORKER"}, on_delete=django.db.models.deletion.CASCADE, related_name="skills", to=settings.AUTH_USER_MODEL)),
            ],
            options={"unique_together": {("worker", "name")}},
        ),
    ]
