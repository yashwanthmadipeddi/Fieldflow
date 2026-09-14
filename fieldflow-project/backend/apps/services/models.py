from django.conf import settings
from django.db import models

class Service(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_minutes = models.PositiveIntegerField(default=60)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["owner", "active"]), models.Index(fields=["name"]) ]

    def __str__(self):
        return self.name

class WorkerSkill(models.Model):
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skills", limit_choices_to={"role": "WORKER"})
    name = models.CharField(max_length=80)
    level = models.PositiveSmallIntegerField(default=1)

    class Meta:
        unique_together = [("worker", "name")]
