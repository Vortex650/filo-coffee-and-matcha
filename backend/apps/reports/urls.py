from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportsViewSet

router = DefaultRouter()
router.register("", ReportsViewSet, basename="reports")

urlpatterns = [path("", include(router.urls))]
