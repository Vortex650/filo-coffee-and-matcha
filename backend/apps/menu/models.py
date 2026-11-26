from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=80)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    class Availability(models.TextChoices):
        AVAILABLE = "available", "Available"
        SOLD_OUT = "sold_out", "Sold out"
        UNAVAILABLE = "unavailable", "Temporarily unavailable"
        SEASONAL = "seasonal", "Seasonal"
        HIDDEN = "hidden", "Hidden"

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    story = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    allergens = models.TextField(blank=True)
    flavor_notes = models.CharField(max_length=160, blank=True)
    tags = models.JSONField(default=list, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True)
    is_available = models.BooleanField(default=True)
    availability_status = models.CharField(
        max_length=20, choices=Availability.choices, default=Availability.AVAILABLE
    )
    availability_note = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    is_seasonal = models.BooleanField(default=False)
    is_signature = models.BooleanField(default=False)
    is_placeholder = models.BooleanField(default=False)
    is_stamp_eligible = models.BooleanField(default=True)
    allows_hot_iced = models.BooleanField(default=False)
    allows_milk = models.BooleanField(default=False)
    allows_sugar = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def is_orderable(self):
        return self.is_available and self.availability_status == self.Availability.AVAILABLE


class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sizes")
    name = models.CharField(max_length=40)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class Addon(models.Model):
    name = models.CharField(max_length=80)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


class ProductAddon(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_addons")
    addon = models.ForeignKey(Addon, on_delete=models.CASCADE, related_name="product_addons")

    class Meta:
        unique_together = ("product", "addon")


class CustomizationGroup(models.Model):
    """Configurable drink option group (temperature, milk, sweetness, etc.).

    Size and add-on groups are derived from ProductSize / ProductAddon so the
    existing ordering API keeps working; everything else is defined here so the
    storefront never hardcodes a product's options.
    """

    class SelectionType(models.TextChoices):
        SINGLE = "single", "Single choice"
        MULTIPLE = "multiple", "Multiple choice"

    class Kind(models.TextChoices):
        TEMPERATURE = "temperature", "Temperature"
        MILK = "milk", "Milk"
        SWEETNESS = "sweetness", "Sweetness"
        ADDON = "addon", "Add-on"
        OTHER = "other", "Other"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="customization_groups")
    key = models.SlugField(max_length=40)
    label = models.CharField(max_length=80)
    help_text = models.CharField(max_length=200, blank=True)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.OTHER)
    selection_type = models.CharField(
        max_length=10, choices=SelectionType.choices, default=SelectionType.SINGLE
    )
    is_required = models.BooleanField(default=False)
    min_select = models.PositiveSmallIntegerField(default=0)
    max_select = models.PositiveSmallIntegerField(null=True, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "label"]
        unique_together = ("product", "key")

    def __str__(self):
        return f"{self.product.name} · {self.label}"


class CustomizationOption(models.Model):
    group = models.ForeignKey(
        CustomizationGroup, on_delete=models.CASCADE, related_name="options"
    )
    key = models.SlugField(max_length=60)
    label = models.CharField(max_length=80)
    description = models.CharField(max_length=200, blank=True)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    availability_status = models.CharField(
        max_length=20,
        choices=Product.Availability.choices,
        default=Product.Availability.AVAILABLE,
    )

    class Meta:
        ordering = ["display_order", "label"]
        unique_together = ("group", "key")

    def __str__(self):
        return f"{self.group.label} · {self.label}"


class Favorite(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="favorites")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-created_at"]

