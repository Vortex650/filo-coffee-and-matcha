from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.core.models import BusinessSettings
from apps.menu.models import Category, Product, ProductSize, Addon, ProductAddon
from apps.payments.models import PaymentMethodConfig


class Command(BaseCommand):
    help = "Seed Phase 1 placeholder data (clearly marked as placeholder)."

    def handle(self, *args, **options):
        BusinessSettings.get()
        cats = [
            ("Espresso-based", "espresso-based"),
            ("Matcha", "matcha"),
            ("Dirty Matcha / Blends", "dirty-matcha-blends"),
            ("Non-coffee", "non-coffee"),
            ("Pastries", "pastries"),
            ("Food", "food"),
        ]
        for i, (name, slug) in enumerate(cats):
            Category.objects.get_or_create(slug=slug, defaults={"name": name, "display_order": i})

        espresso = Category.objects.get(slug="espresso-based")
        matcha = Category.objects.get(slug="matcha")

        sizes = [("Small", Decimal("0")), ("Medium", Decimal("20")), ("Large", Decimal("40"))]

        p1, _ = Product.objects.get_or_create(
            slug="house-blend-latte",
            defaults={
                "category": espresso,
                "name": "House Blend Latte (PLACEHOLDER)",
                "description": "Placeholder product — replace with official menu.",
                "base_price": Decimal("120.00"),
                "is_featured": True,
                "is_best_seller": True,
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "display_order": 1,
            },
        )
        for i, (n, adj) in enumerate(sizes):
            ProductSize.objects.get_or_create(product=p1, name=n, defaults={"price_adjustment": adj, "display_order": i})

        p2, _ = Product.objects.get_or_create(
            slug="ceremonial-matcha-latte",
            defaults={
                "category": matcha,
                "name": "Ceremonial Matcha Latte (PLACEHOLDER)",
                "description": "Placeholder product — replace with official menu.",
                "base_price": Decimal("150.00"),
                "is_featured": True,
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "display_order": 1,
            },
        )
        for i, (n, adj) in enumerate(sizes):
            ProductSize.objects.get_or_create(product=p2, name=n, defaults={"price_adjustment": adj, "display_order": i})

        addon, _ = Addon.objects.get_or_create(name="Extra Shot (PLACEHOLDER)", defaults={"price": Decimal("30.00")})
        ProductAddon.objects.get_or_create(product=p1, addon=addon)

        methods = [
            ("gcash", "GCash", True),
            ("maya", "Maya", True),
            ("bank", "Bank Transfer", True),
            ("cash", "Cash", False),
        ]
        for i, (m, label, req) in enumerate(methods):
            PaymentMethodConfig.objects.get_or_create(
                method=m,
                defaults={"is_enabled": True, "requires_verification": req, "display_order": i, "instructions": f"Placeholder instructions for {label}"},
            )

        self.stdout.write(self.style.SUCCESS("Seeded Phase 1 placeholder data."))
