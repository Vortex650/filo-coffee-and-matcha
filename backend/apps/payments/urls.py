from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentMethodConfigViewSet, PaymentVerificationViewSet

router = DefaultRouter()
router.register("methods", PaymentMethodConfigViewSet, basename="payment-method")
router.register("verifications", PaymentVerificationViewSet, basename="payment-verification")

urlpatterns = [path("", include(router.urls))]
