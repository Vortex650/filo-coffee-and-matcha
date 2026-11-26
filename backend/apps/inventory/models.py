from django.db import models


class Ingredient(models.Model):
    name = models.CharField(max_length=120)
    unit = models.CharField(max_length=20, default="g")  # g, ml, pcs
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    minimum_threshold = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    cost_per_unit = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    supplier = models.CharField(max_length=160, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def is_low(self):
        return self.stock_quantity <= self.minimum_threshold


class RecipeItem(models.Model):
    product = models.ForeignKey("menu.Product", on_delete=models.CASCADE, related_name="recipe_items")
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="recipe_items")
    quantity = models.DecimalField(max_digits=12, decimal_places=3)

    class Meta:
        unique_together = ("product", "ingredient")

    def __str__(self):
        return f"{self.product} - {self.ingredient}"


class StockMovement(models.Model):
    class Type(models.TextChoices):
        STOCK_IN = "stock_in", "Stock In"
        ADJUSTMENT = "adjustment", "Adjustment"
        WASTE = "waste", "Waste"
        SALE = "sale", "Sale Deduction"
        RESTORE = "restore", "Restore"

    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="movements")
    movement_type = models.CharField(max_length=20, choices=Type.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    order = models.ForeignKey("orders.Order", null=True, blank=True, on_delete=models.SET_NULL, related_name="stock_movements")
    note = models.TextField(blank=True)
    created_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
