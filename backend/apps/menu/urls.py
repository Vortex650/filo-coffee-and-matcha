from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ProductSizeViewSet, AddonViewSet, FavoriteViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("sizes", ProductSizeViewSet, basename="size")
router.register("addons", AddonViewSet, basename="addon")
router.register("favorites", FavoriteViewSet, basename="favorite")

urlpatterns = [path("", include(router.urls))]
