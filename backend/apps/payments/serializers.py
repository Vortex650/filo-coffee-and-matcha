from rest_framework import serializers
from .models import PaymentMethodConfig, PaymentVerification


class PaymentMethodConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethodConfig
        fields = "__all__"


class PaymentVerificationSerializer(serializers.ModelSerializer):
    order_code = serializers.CharField(source="order.order_code", read_only=True)
    customer_name = serializers.CharField(source="order.customer_name", read_only=True)
    total = serializers.DecimalField(source="order.total", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentVerification
        fields = ["id", "order", "order_code", "customer_name", "total", "reference_number", "submitted_at", "verified_by", "verified_at", "status", "rejection_reason"]
        read_only_fields = ["id", "submitted_at", "verified_by", "verified_at", "status"]
