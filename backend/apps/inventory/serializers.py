from rest_framework import serializers
from .models import Ingredient, RecipeItem, StockMovement


class IngredientSerializer(serializers.ModelSerializer):
    is_low = serializers.BooleanField(read_only=True)
    class Meta:
        model = Ingredient
        fields = "__all__"


class RecipeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeItem
        fields = "__all__"


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = "__all__"
        read_only_fields = ["created_by"]
