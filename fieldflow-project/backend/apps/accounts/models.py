from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        WORKER = "WORKER", "Worker"
        CUSTOMER = "CUSTOMER", "Customer"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone = models.CharField(max_length=30, blank=True)
    business_name = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
