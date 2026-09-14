from rest_framework import serializers
from .models import Service, WorkerSkill

class ServiceSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)

    class Meta:
        model = Service
        fields = ["id", "owner", "owner_name", "name", "description", "base_price", "estimated_minutes", "active", "created_at", "updated_at"]
        read_only_fields = ["owner", "owner_name", "created_at", "updated_at"]

class WorkerSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerSkill
        fields = ["id", "worker", "name", "level"]
        read_only_fields = ["worker"]
