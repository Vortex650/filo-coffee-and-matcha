from decimal import Decimal, InvalidOperation
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Ingredient, RecipeItem, StockMovement
from .serializers import IngredientSerializer, RecipeItemSerializer, StockMovementSerializer
from apps.core.permissions import IsManagerOrOwner


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsManagerOrOwner]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        items = [i for i in Ingredient.objects.filter(is_active=True) if i.is_low]
        return Response(IngredientSerializer(items, many=True).data)

    @action(detail=True, methods=["post"])
    def stock_in(self, request, pk=None):
        ing = self.get_object()
        try:
            qty = Decimal(str(request.data.get("quantity")))
        except (TypeError, ValueError, InvalidOperation):
            return Response({"detail": "Invalid quantity"}, status=400)
        if qty <= 0:
            return Response({"detail": "Quantity must be greater than zero"}, status=400)
        with transaction.atomic():
            ing.stock_quantity = ing.stock_quantity + qty
            ing.save(update_fields=["stock_quantity", "updated_at"])
            StockMovement.objects.create(ingredient=ing, movement_type=StockMovement.Type.STOCK_IN, quantity=qty, note=request.data.get("note", ""), created_by=request.user)
        return Response(IngredientSerializer(ing).data)

    @action(detail=True, methods=["post"])
    def adjust(self, request, pk=None):
        ing = self.get_object()
        try:
            qty = Decimal(str(request.data.get("quantity", 0)))
        except (TypeError, ValueError, InvalidOperation):
            return Response({"detail": "Invalid quantity"}, status=400)
        movement_type = request.data.get("movement_type", StockMovement.Type.ADJUSTMENT)
        with transaction.atomic():
            ing.stock_quantity = ing.stock_quantity + qty
            ing.save(update_fields=["stock_quantity", "updated_at"])
            StockMovement.objects.create(ingredient=ing, movement_type=movement_type, quantity=qty, note=request.data.get("note", ""), created_by=request.user)
        return Response(IngredientSerializer(ing).data)


class RecipeItemViewSet(viewsets.ModelViewSet):
    queryset = RecipeItem.objects.select_related("product", "ingredient")
    serializer_class = RecipeItemSerializer
    permission_classes = [IsManagerOrOwner]


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related("ingredient")
    serializer_class = StockMovementSerializer
    permission_classes = [IsManagerOrOwner]
