from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessSettingsViewSet, AuditLogViewSet, health

router = DefaultRouter()
router.register("settings", BusinessSettingsViewSet, basename="settings")
router.register("audit-logs", AuditLogViewSet, basename="audit-log")

urlpatterns = [
    path("health/", health, name="health"),
    path("", include(router.urls)),
]
