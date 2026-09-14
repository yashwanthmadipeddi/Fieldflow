from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import ServiceViewSet, WorkerSkillViewSet

router = DefaultRouter()
router.register("catalog", ServiceViewSet, basename="service")
router.register("skills", WorkerSkillViewSet, basename="worker-skill")

urlpatterns = [path("", include(router.urls))]
