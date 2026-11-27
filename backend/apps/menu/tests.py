"""Focused tests for the authoritative menu pricing rules."""
from decimal import Decimal

from rest_framework.test import APITestCase

from .models import (
    Addon,
    Category,
    CustomizationGroup,
    CustomizationOption,
    Product,
    ProductAddon,
    ProductSize,
)


class PriceEndpointTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Coffee")
        self.product = Product.objects.create(
            category=self.category,
            name="Test Latte",
            base_price=Decimal("120.00"),
        )
        self.size = ProductSize.objects.create(
            product=self.product, name="Large", price_adjustment=Decimal("20.00")
        )
        self.addon = Addon.objects.create(name="Extra shot", price=Decimal("40.00"))
        ProductAddon.objects.create(product=self.product, addon=self.addon)
        group = CustomizationGroup.objects.create(
            product=self.product, key="milk", label="Milk", kind="milk"
        )
        self.option = CustomizationOption.objects.create(
            group=group, key="oat", label="Oat milk", price_adjustment=Decimal("15.00")
        )
        self.url = f"/api/v1/menu/products/{self.product.id}/price/"

    def test_base_price_without_selections(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["unit_price"]), Decimal("120.00"))
        self.assertEqual(Decimal(response.data["line_total"]), Decimal("120.00"))

    def test_size_option_and_addon_are_summed(self):
        response = self.client.post(
            self.url,
            {
                "size_id": self.size.id,
                "option_ids": [self.option.id],
                "addon_ids": [self.addon.id],
                "quantity": 2,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["unit_price"]), Decimal("195.00"))
        self.assertEqual(Decimal(response.data["line_total"]), Decimal("390.00"))
        self.assertEqual(response.data["quantity"], 2)
        self.assertEqual(response.data["selected_option_ids"], [self.option.id])
        self.assertEqual(response.data["selected_addon_ids"], [self.addon.id])

    def test_client_supplied_prices_are_ignored(self):
        response = self.client.post(
            self.url,
            {
                "size_id": self.size.id,
                "unit_price": "0.01",
                "line_total": "0.01",
                "quantity": 1,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["unit_price"]), Decimal("140.00"))

    def test_unknown_size_is_rejected(self):
        response = self.client.post(
            self.url, {"size_id": 999999}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_inactive_size_is_rejected(self):
        self.size.is_active = False
        self.size.save(update_fields=["is_active"])
        response = self.client.post(
            self.url, {"size_id": self.size.id}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_inactive_option_is_not_charged(self):
        self.option.is_active = False
        self.option.save(update_fields=["is_active"])
        response = self.client.post(
            self.url, {"option_ids": [self.option.id]}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["unit_price"]), Decimal("120.00"))
        self.assertEqual(response.data["selected_option_ids"], [])

    def test_addon_not_linked_to_product_is_ignored(self):
        other = Addon.objects.create(name="Unlinked", price=Decimal("99.00"))
        response = self.client.post(
            self.url, {"addon_ids": [other.id]}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["unit_price"]), Decimal("120.00"))
        self.assertEqual(response.data["selected_addon_ids"], [])

    def test_quantity_is_clamped_to_at_least_one(self):
        response = self.client.post(self.url, {"quantity": 0}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["breakdown"]), 1)
        self.assertEqual(Decimal(response.data["line_total"]), Decimal("120.00"))
