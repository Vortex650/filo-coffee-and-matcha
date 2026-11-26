from rest_framework import serializers
from .models import (
    Category,
    Product,
    ProductSize,
    Addon,
    ProductAddon,
    Favorite,
    CustomizationGroup,
    CustomizationOption,
)
from .services import normalized_groups, product_badges


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = "__all__"

    def get_product_count(self, obj):
        return obj.products.exclude(
            availability_status=Product.Availability.HIDDEN
        ).count()


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = "__all__"


class AddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Addon
        fields = "__all__"


class CustomizationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomizationOption
        fields = "__all__"


class CustomizationGroupSerializer(serializers.ModelSerializer):
    options = CustomizationOptionSerializer(many=True, read_only=True)

    class Meta:
        model = CustomizationGroup
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    sizes = ProductSizeSerializer(many=True, read_only=True)
    addons = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.SlugField(source="category.slug", read_only=True)
    badges = serializers.SerializerMethodField()
    customization_groups = serializers.SerializerMethodField()
    is_orderable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

    def get_addons(self, obj):
        addons = [pa.addon for pa in obj.product_addons.all()]
        return AddonSerializer(addons, many=True).data

    def get_avg_rating(self, obj):
        from django.db.models import Avg
        value = obj.reviews.filter(is_published=True).aggregate(v=Avg("rating"))["v"]
        return round(value, 1) if value is not None else None

    def get_review_count(self, obj):
        return obj.reviews.filter(is_published=True).count()

    def get_badges(self, obj):
        return product_badges(obj)

    def get_customization_groups(self, obj):
        return normalized_groups(obj)


class FavoriteSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "product", "product_detail", "created_at"]
