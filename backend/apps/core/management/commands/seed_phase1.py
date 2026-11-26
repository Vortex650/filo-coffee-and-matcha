from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.core.models import BusinessSettings
from apps.menu.models import (
    Category,
    Product,
    ProductSize,
    Addon,
    ProductAddon,
    CustomizationGroup,
    CustomizationOption,
)
from apps.payments.models import PaymentMethodConfig


DRINK_SIZES = [("Small", Decimal("0")), ("Medium", Decimal("20")), ("Large", Decimal("40"))]
MILK_OPTIONS = [
    ("whole", "Whole milk", "The house default."),
    ("oat", "Oat milk", "Creamy and gently sweet."),
    ("almond", "Almond milk", "Light, nutty finish."),
    ("soy", "Soy milk", "Smooth and full-bodied."),
]
SWEETNESS_OPTIONS = ["0%", "25%", "50%", "75%", "100%"]


def ensure_group(product, key, label, kind, selection_type, options, *, required=False, help_text="", max_select=None, default_key=None):
    group, _ = CustomizationGroup.objects.update_or_create(
        product=product,
        key=key,
        defaults={
            "label": label,
            "help_text": help_text,
            "kind": kind,
            "selection_type": selection_type,
            "is_required": required,
            "min_select": 1 if required else 0,
            "max_select": max_select if max_select is not None else (1 if selection_type == "single" else None),
            "display_order": {"temperature": 0, "milk": 2, "sweetness": 3}.get(key, 4),
            "is_active": True,
        },
    )
    for i, option in enumerate(options):
        if isinstance(option, str):
            name, description, price = option, "", Decimal("0")
        else:
            name, description, price = option
        option_key = name.lower().replace(" ", "-").replace("%", "pct")
        CustomizationOption.objects.update_or_create(
            group=group,
            key=option_key,
            defaults={
                "label": name,
                "description": description,
                "price_adjustment": price,
                "is_default": (option_key == default_key) if default_key else i == 0,
                "display_order": i,
                "is_active": True,
            },
        )
    return group


class Command(BaseCommand):
    help = "Seed Phase 1/2 sample data (clearly flagged as placeholder)."

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
            Category.objects.update_or_create(
                slug=slug, defaults={"name": name, "display_order": i, "is_active": True}
            )

        cat = {slug: Category.objects.get(slug=slug) for _, slug in cats}

        products = [
            {
                "slug": "house-blend-latte",
                "category": cat["espresso-based"],
                "name": "House Blend Latte",
                "description": "A sample espresso latte — placeholder until our official recipe is confirmed.",
                "story": "Our house espresso, softened with steamed milk.",
                "flavor_notes": "Cocoa · caramel · toasted nuts",
                "tags": ["coffee", "espresso", "hot", "iced"],
                "base_price": Decimal("120.00"),
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "is_featured": True,
                "is_best_seller": True,
                "is_signature": True,
                "display_order": 1,
            },
            {
                "slug": "americano",
                "category": cat["espresso-based"],
                "name": "Americano",
                "description": "A sample long black — placeholder until our official menu is confirmed.",
                "story": "Espresso lengthened with hot water for a clean, bright cup.",
                "flavor_notes": "Dark chocolate · citrus",
                "tags": ["coffee", "espresso", "hot", "iced"],
                "base_price": Decimal("100.00"),
                "allows_hot_iced": True,
                "display_order": 2,
            },
            {
                "slug": "cappuccino",
                "category": cat["espresso-based"],
                "name": "Cappuccino",
                "description": "A sample cappuccino — placeholder until our official menu is confirmed.",
                "story": "Equal parts espresso, milk, and foam.",
                "flavor_notes": "Cocoa · malt",
                "tags": ["coffee", "espresso", "hot"],
                "base_price": Decimal("130.00"),
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "display_order": 3,
            },
            {
                "slug": "spanish-latte",
                "category": cat["espresso-based"],
                "name": "Spanish Latte",
                "description": "A sample sweet latte — placeholder until our official menu is confirmed.",
                "story": "Espresso and milk with a gentle sweetness.",
                "flavor_notes": "Caramel · vanilla",
                "tags": ["coffee", "espresso", "iced", "sweet"],
                "base_price": Decimal("140.00"),
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "is_best_seller": True,
                "display_order": 4,
            },
            {
                "slug": "ceremonial-matcha-latte",
                "category": cat["matcha"],
                "name": "Ceremonial Matcha Latte",
                "description": "A sample matcha latte — placeholder until our official menu is confirmed.",
                "story": "Stone-ground matcha whisked with milk.",
                "flavor_notes": "Fresh grass · cream",
                "tags": ["matcha", "hot", "iced"],
                "base_price": Decimal("150.00"),
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "is_featured": True,
                "is_signature": True,
                "display_order": 1,
            },
            {
                "slug": "matcha-americano",
                "category": cat["matcha"],
                "name": "Matcha Americano",
                "description": "A sample matcha americano — placeholder until our official menu is confirmed.",
                "story": "Matcha and water, kept clean and bright.",
                "flavor_notes": "Vegetal · crisp",
                "tags": ["matcha", "hot", "iced"],
                "base_price": Decimal("130.00"),
                "allows_hot_iced": True,
                "allows_sugar": True,
                "is_new": True,
                "display_order": 2,
            },
            {
                "slug": "dirty-matcha",
                "category": cat["dirty-matcha-blends"],
                "name": "Dirty Matcha",
                "description": "A sample matcha-and-espresso blend — placeholder until our official menu is confirmed.",
                "story": "Matcha and milk layered with a shot of espresso.",
                "flavor_notes": "Matcha · cocoa · cream",
                "tags": ["matcha", "coffee", "iced"],
                "base_price": Decimal("160.00"),
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "is_featured": True,
                "is_best_seller": True,
                "display_order": 1,
            },
            {
                "slug": "chocolate",
                "category": cat["non-coffee"],
                "name": "Chocolate",
                "description": "A sample hot chocolate — placeholder until our official menu is confirmed.",
                "story": "Cocoa and milk, warm and simple.",
                "flavor_notes": "Cocoa · vanilla",
                "tags": ["non-coffee", "hot", "iced"],
                "base_price": Decimal("120.00"),
                "allows_hot_iced": True,
                "allows_milk": True,
                "allows_sugar": True,
                "display_order": 1,
            },
            {
                "slug": "strawberry-milk",
                "category": cat["non-coffee"],
                "name": "Strawberry Milk",
                "description": "A sample strawberry milk — placeholder until our official menu is confirmed.",
                "story": "Milk and strawberry, served over ice.",
                "flavor_notes": "Strawberry · cream",
                "tags": ["non-coffee", "iced", "seasonal"],
                "base_price": Decimal("130.00"),
                "allows_milk": True,
                "allows_sugar": True,
                "is_seasonal": True,
                "display_order": 2,
            },
            {
                "slug": "butter-croissant",
                "category": cat["pastries"],
                "name": "Butter Croissant",
                "description": "A sample pastry — placeholder until our official menu is confirmed.",
                "story": "Laminated butter pastry, baked until golden.",
                "flavor_notes": "Butter · wheat",
                "tags": ["pastry", "food"],
                "base_price": Decimal("90.00"),
                "is_new": True,
                "is_stamp_eligible": False,
                "display_order": 1,
            },
        ]

        addons = {
            "extra-espresso": Addon.objects.update_or_create(
                name="Extra Espresso Shot",
                defaults={"price": Decimal("30.00"), "display_order": 0, "is_active": True},
            )[0],
            "extra-matcha": Addon.objects.update_or_create(
                name="Extra Matcha Scoop",
                defaults={"price": Decimal("40.00"), "display_order": 1, "is_active": True},
            )[0],
            "vanilla": Addon.objects.update_or_create(
                name="Vanilla Syrup",
                defaults={"price": Decimal("20.00"), "display_order": 2, "is_active": True},
            )[0],
        }

        for entry in products:
            product, _ = Product.objects.update_or_create(
                slug=entry["slug"],
                defaults={
                    **entry,
                    "is_placeholder": True,
                    "is_available": True,
                    "availability_status": Product.Availability.AVAILABLE,
                },
            )

            # Sizes for drinks.
            if entry["slug"] not in ("butter-croissant",):
                for i, (name, adj) in enumerate(DRINK_SIZES):
                    ProductSize.objects.update_or_create(
                        product=product,
                        name=name,
                        defaults={"price_adjustment": adj, "display_order": i, "is_active": True},
                    )
            else:
                product.sizes.all().delete()

            # Temperature group.
            if product.allows_hot_iced:
                ensure_group(
                    product,
                    "temperature",
                    "Temperature",
                    CustomizationGroup.Kind.TEMPERATURE,
                    CustomizationGroup.SelectionType.SINGLE,
                    [
                        ("Hot", "Served warm.", Decimal("0")),
                        ("Iced", "Served over ice.", Decimal("0")),
                    ],
                    required=True,
                    default_key="hot",
                )

            # Milk group.
            if product.allows_milk:
                ensure_group(
                    product,
                    "milk",
                    "Milk",
                    CustomizationGroup.Kind.MILK,
                    CustomizationGroup.SelectionType.SINGLE,
                    [
                        (name, description, Decimal("0"))
                        for _, name, description in MILK_OPTIONS
                    ],
                    help_text="Alternative milks may carry an extra charge at launch.",
                    default_key="whole-milk",
                )

            # Sweetness group.
            if product.allows_sugar:
                ensure_group(
                    product,
                    "sweetness",
                    "Sweetness",
                    CustomizationGroup.Kind.SWEETNESS,
                    CustomizationGroup.SelectionType.SINGLE,
                    SWEETNESS_OPTIONS,
                    default_key="100pct",
                )

            # Add-ons.
            wanted = []
            if "coffee" in product.tags:
                wanted.extend([addons["extra-espresso"], addons["vanilla"]])
            if "matcha" in product.tags:
                wanted.append(addons["extra-matcha"])
            if "non-coffee" in product.tags:
                wanted.append(addons["vanilla"])
            for addon in wanted:
                ProductAddon.objects.get_or_create(product=product, addon=addon)

        methods = [
            ("gcash", "GCash", True),
            ("maya", "Maya", True),
            ("bank", "Bank Transfer", True),
            ("cash", "Cash", False),
        ]
        for i, (m, label, req) in enumerate(methods):
            PaymentMethodConfig.objects.get_or_create(
                method=m,
                defaults={
                    "is_enabled": True,
                    "requires_verification": req,
                    "display_order": i,
                    "instructions": f"Placeholder instructions for {label}",
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded sample menu data (products flagged is_placeholder=True)."
            )
        )
