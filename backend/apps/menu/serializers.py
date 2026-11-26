from rest_framework import serializers
from .models import Category, Product, ProductSize, Addon, ProductAddon, Favorite


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = "__all__"


class AddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Addon
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    sizes = ProductSizeSerializer(many=True, read_only=True)
    addons = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_addons(self, obj):
        addons = [pa.addon for pa in obj.product_addons.select_related("addon")]
        return AddonSerializer(addons, many=True).data

    def get_avg_rating(self, obj):
        from django.db.models import Avg
        value = obj.reviews.filter(is_published=True).aggregate(v=Avg("rating"))["v"]
        return round(value, 1) if value is not None else None

    def get_review_count(self, obj):
        return obj.reviews.filter(is_published=True).count()


class FavoriteSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    class Meta:
        model = Favorite
        fields = ["id", "product", "product_detail", "created_at"]
