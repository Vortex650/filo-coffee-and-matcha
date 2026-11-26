from rest_framework import serializers
from .models import LoyaltyAccount, LoyaltyTransaction


class LoyaltyAccountSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        model = LoyaltyAccount
        fields = ["id", "user", "user_email", "stars", "created_at", "updated_at"]


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = "__all__"
