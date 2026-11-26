from decimal import Decimal
from django.db import transaction
from .models import Ingredient, RecipeItem, StockMovement


def deduct_for_order(order):
    """Deduct inventory for a completed order exactly once. Returns True if applied."""
    if StockMovement.objects.filter(order=order, movement_type=StockMovement.Type.SALE).exists():
        return False
    with transaction.atomic():
        # aggregate requirements per ingredient
        requirements = {}
        for item in order.items.select_related("product"):
            if not item.product:
                continue
            for ri in item.product.recipe_items.select_related("ingredient"):
                qty = ri.quantity * item.quantity
                requirements[ri.ingredient_id] = requirements.get(ri.ingredient_id, Decimal("0")) + qty
        for ing_id, qty in requirements.items():
            ing = Ingredient.objects.select_for_update().get(pk=ing_id)
            ing.stock_quantity = ing.stock_quantity - qty
            ing.save(update_fields=["stock_quantity", "updated_at"])
            StockMovement.objects.create(ingredient=ing, movement_type=StockMovement.Type.SALE, quantity=-qty, order=order, note=f"Deducted for {order.order_code}")
    return True


def restore_for_order(order):
    """Restore inventory if an order is cancelled after deduction."""
    movements = order.stock_movements.filter(movement_type=StockMovement.Type.SALE)
    if not movements.exists():
        return False
    with transaction.atomic():
        for m in movements.select_related("ingredient"):
            ing = Ingredient.objects.select_for_update().get(pk=m.ingredient_id)
            ing.stock_quantity = ing.stock_quantity - m.quantity  # m.quantity is negative
            ing.save(update_fields=["stock_quantity", "updated_at"])
            StockMovement.objects.create(ingredient=ing, movement_type=StockMovement.Type.RESTORE, quantity=-m.quantity, order=order, note="Restored on cancellation")
    return True
