from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    product_name = serializers.CharField(source="product.name", read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "product", "product_name", "user", "user_name", "rating",
            "comment", "is_published", "is_verified", "created_at",
        ]
        read_only_fields = ["user"]

    def get_user_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name or "Filo guest"

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        product = validated_data["product"]
        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError({"detail": "You have already reviewed this product."})
        from apps.orders.models import Order
        order = (
            Order.objects.filter(created_by=user, status=Order.Status.COMPLETED, items__product=product)
            .order_by("-created_at")
            .first()
        )
        validated_data["is_published"] = True
        review = Review.objects.create(user=user, order=order, **validated_data)
        return review

    def update(self, instance, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated and getattr(user, "is_staff_role", False)):
            validated_data.pop("is_published", None)
        return super().update(instance, validated_data)
