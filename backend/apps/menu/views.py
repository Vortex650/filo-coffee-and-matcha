from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Category,
    Product,
    ProductSize,
    Addon,
    Favorite,
    CustomizationGroup,
    CustomizationOption,
)
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductSizeSerializer,
    AddonSerializer,
    FavoriteSerializer,
    CustomizationGroupSerializer,
    CustomizationOptionSerializer,
)
from .services import calculate_price, related_products
from apps.core.permissions import IsManagerOrOwner


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects.select_related("category")
        .prefetch_related(
            "sizes",
            "product_addons__addon",
            "customization_groups__options",
            "reviews",
        )
    )
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "category",
        "category__slug",
        "is_available",
        "is_featured",
        "is_best_seller",
        "is_new",
        "is_seasonal",
        "is_signature",
        "availability_status",
    ]
    search_fields = ["name", "description", "story", "flavor_notes", "category__name"]
    ordering_fields = ["base_price", "display_order", "created_at", "name"]
    ordering = ["display_order", "name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "sizes", "price", "related"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        is_staff = bool(user and user.is_authenticated and user.is_staff)
        if not is_staff:
            qs = qs.exclude(availability_status=Product.Availability.HIDDEN)
        tag = self.request.query_params.get("tag")
        if tag:
            qs = qs.filter(tags__contains=[tag])
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price:
            qs = qs.filter(base_price__gte=min_price)
        if max_price:
            qs = qs.filter(base_price__lte=max_price)
        return qs

    @action(detail=True, methods=["get"])
    def sizes(self, request, pk=None):
        product = self.get_object()
        return Response(
            ProductSizeSerializer(product.sizes.filter(is_active=True), many=True).data
        )

    @action(detail=True, methods=["get"])
    def related(self, request, pk=None):
        product = self.get_object()
        limit = min(int(request.query_params.get("limit", 4) or 4), 8)
        data = ProductSerializer(
            related_products(product, limit=limit), many=True, context={"request": request}
        ).data
        return Response(data)

    @action(detail=True, methods=["post"])
    def price(self, request, pk=None):
        """Authoritative unit-price calculation for a set of selections."""
        product = self.get_object()
        try:
            result = calculate_price(
                product,
                size_id=request.data.get("size_id"),
                option_ids=request.data.get("option_ids") or [],
                addon_ids=request.data.get("addon_ids") or [],
                quantity=request.data.get("quantity") or 1,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("product")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, product=product
        )
        return Response(
            self.get_serializer(favorite).data, status=201 if created else 200
        )


class ProductSizeViewSet(viewsets.ModelViewSet):
    queryset = ProductSize.objects.all()
    serializer_class = ProductSizeSerializer
    permission_classes = [IsManagerOrOwner]


class AddonViewSet(viewsets.ModelViewSet):
    queryset = Addon.objects.all()
    serializer_class = AddonSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]


class CustomizationGroupViewSet(viewsets.ModelViewSet):
    queryset = CustomizationGroup.objects.prefetch_related("options")
    serializer_class = CustomizationGroupSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["product", "kind", "is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]


class CustomizationOptionViewSet(viewsets.ModelViewSet):
    queryset = CustomizationOption.objects.all()
    serializer_class = CustomizationOptionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["group", "is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]
