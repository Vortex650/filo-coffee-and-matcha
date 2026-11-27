from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductSizeViewSet,
    AddonViewSet,
    ProductAddonViewSet,
    FavoriteViewSet,
    CustomizationGroupViewSet,
    CustomizationOptionViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("sizes", ProductSizeViewSet, basename="size")
router.register("addons", AddonViewSet, basename="addon")
router.register("product-addons", ProductAddonViewSet, basename="product-addon")
router.register("favorites", FavoriteViewSet, basename="favorite")
router.register("customization-groups", CustomizationGroupViewSet, basename="customization-group")
router.register("customization-options", CustomizationOptionViewSet, basename="customization-option")

urlpatterns = [path("", include(router.urls))]
