from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IngredientViewSet, RecipeItemViewSet, StockMovementViewSet

router = DefaultRouter()
router.register("ingredients", IngredientViewSet, basename="ingredient")
router.register("recipes", RecipeItemViewSet, basename="recipe")
router.register("movements", StockMovementViewSet, basename="movement")

urlpatterns = [path("", include(router.urls))]
