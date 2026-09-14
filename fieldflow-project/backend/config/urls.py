from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/services/", include("apps.services.urls")),
    path("api/v1/workorders/", include("apps.workorders.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/health/", include("apps.common.urls")),
]
