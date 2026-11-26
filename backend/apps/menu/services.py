"""Menu presentation helpers shared by the API views and serializers."""
from decimal import Decimal

from .models import Product


def _option_payload(option, *, available=None):
    return {
        "id": option.id,
        "key": option.key,
        "label": option.label,
        "description": option.description,
        "price_adjustment": str(option.price_adjustment),
        "is_default": option.is_default,
        "available": (
            option.availability_status == Product.Availability.AVAILABLE
            if available is None
            else available
        ),
    }


def normalized_groups(product, *, include_unavailable=True):
    """Return the product's customization config in one stable shape.

    Groups sourced from ``CustomizationGroup`` come first, followed by the
    derived size and add-on groups that the existing ordering API relies on.
    """
    kind_order = {"temperature": 0, "size": 1, "milk": 2, "sweetness": 3, "addon": 4}
    groups = []

    for group in product.customization_groups.all():
        if not group.is_active:
            continue
        options = [o for o in group.options.all() if o.is_active or include_unavailable]
        if not options:
            continue
        groups.append(
            {
                "key": group.key,
                "label": group.label,
                "help_text": group.help_text,
                "kind": group.kind,
                "selection_type": group.selection_type,
                "required": group.is_required,
                "min_select": group.min_select or (1 if group.is_required else 0),
                "max_select": group.max_select
                if group.max_select is not None
                else (1 if group.selection_type == "single" else None),
                "display_order": kind_order.get(group.kind, 5),
                "options": [
                    _option_payload(
                        o,
                        available=o.availability_status == Product.Availability.AVAILABLE,
                    )
                    for o in options
                ],
            }
        )

    sizes = [s for s in product.sizes.all() if s.is_active or include_unavailable]
    if sizes:
        groups.append(
            {
                "key": "size",
                "label": "Size",
                "help_text": "",
                "kind": "size",
                "selection_type": "single",
                "required": True,
                "min_select": 1,
                "max_select": 1,
                "display_order": kind_order["size"],
                "options": [
                    {
                        "id": s.id,
                        "key": str(s.id),
                        "label": s.name,
                        "description": "",
                        "price_adjustment": str(s.price_adjustment),
                        "is_default": i == 0,
                        "available": s.is_active,
                        "size_id": s.id,
                    }
                    for i, s in enumerate(sizes)
                ],
            }
        )

    addons = [
        pa.addon
        for pa in product.product_addons.all()
        if pa.addon.is_active or include_unavailable
    ]
    if addons:
        groups.append(
            {
                "key": "addons",
                "label": "Add-ons",
                "help_text": "Optional extras",
                "kind": "addon",
                "selection_type": "multiple",
                "required": False,
                "min_select": 0,
                "max_select": None,
                "display_order": kind_order["addon"],
                "options": [
                    {
                        "id": a.id,
                        "key": str(a.id),
                        "label": a.name,
                        "description": "",
                        "price_adjustment": str(a.price),
                        "is_default": False,
                        "available": a.is_active,
                        "addon_id": a.id,
                    }
                    for a in addons
                ],
            }
        )

    groups.sort(key=lambda g: (g["display_order"], g["label"]))
    return groups


def product_badges(product):
    badges = []
    if product.is_signature:
        badges.append({"label": "Signature", "tone": "ink"})
    if product.is_best_seller:
        badges.append({"label": "Best Seller", "tone": "sand"})
    if product.is_new:
        badges.append({"label": "New", "tone": "matcha"})
    if product.is_seasonal or product.availability_status == Product.Availability.SEASONAL:
        badges.append({"label": "Seasonal", "tone": "sand"})
    if product.is_placeholder:
        badges.append({"label": "Sample", "tone": "ink"})
    return badges


def calculate_price(product, *, size_id=None, option_ids=None, addon_ids=None, quantity=1):
    """Authoritative price calculation used by the price-preview endpoint."""
    option_ids = set(option_ids or [])
    addon_ids = set(addon_ids or [])
    quantity = max(1, int(quantity or 1))

    lines = [{"label": "Base", "amount": str(product.base_price)}]
    unit = Decimal(product.base_price)

    if size_id:
        size = product.sizes.filter(id=size_id, is_active=True).first()
        if size is None:
            raise ValueError("Selected size is not available for this drink.")
        if size.price_adjustment:
            unit += size.price_adjustment
            lines.append(
                {"label": size.name, "amount": str(size.price_adjustment)}
            )

    selected_options = []
    for group in product.customization_groups.all():
        if not group.is_active:
            continue
        for option in group.options.all():
            if option.id in option_ids and option.is_active:
                selected_options.append(option)
                if option.price_adjustment:
                    unit += option.price_adjustment
                    lines.append(
                        {
                            "label": option.label,
                            "amount": str(option.price_adjustment),
                        }
                    )

    selected_addons = []
    for pa in product.product_addons.select_related("addon"):
        addon = pa.addon
        if addon.id in addon_ids and addon.is_active:
            selected_addons.append(addon)
            if addon.price:
                unit += addon.price
                lines.append({"label": addon.name, "amount": str(addon.price)})

    return {
        "unit_price": str(unit),
        "quantity": quantity,
        "line_total": str(unit * quantity),
        "breakdown": lines,
        "selected_option_ids": sorted(o.id for o in selected_options),
        "selected_addon_ids": sorted(a.id for a in selected_addons),
    }


def related_products(product, limit=4):
    """Simple, explainable recommendations: same collection first, then house picks."""
    base = (
        Product.objects.select_related("category")
        .prefetch_related("sizes", "product_addons__addon", "customization_groups__options")
        .exclude(id=product.id)
        .exclude(availability_status=Product.Availability.HIDDEN)
    )
    same = list(
        base.filter(category=product.category).order_by(
            "-is_best_seller", "-is_featured", "display_order", "name"
        )[:limit]
    )
    if len(same) < limit:
        seen = {p.id for p in same}
        fill = (
            base.exclude(id__in=seen)
            .filter(is_featured=True)
            .order_by("-is_best_seller", "display_order", "name")[: limit - len(same)]
        )
        same.extend(fill)
    if len(same) < limit:
        seen = {p.id for p in same}
        fill = base.exclude(id__in=seen).order_by("display_order", "name")[
            : limit - len(same)
        ]
        same.extend(fill)
    return same
