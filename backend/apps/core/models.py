from django.db import models


class BusinessSettings(models.Model):
    business_name = models.CharField(max_length=120, default="Filo Coffee and Matcha")
    tagline = models.CharField(max_length=160, default="Crafted simply. Served warmly.")
    address = models.TextField(blank=True)
    contact_number = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    opening_hours = models.JSONField(default=dict, blank=True)
    social = models.JSONField(default=dict, blank=True)
    logo_url = models.URLField(blank=True)
    matcha_green = models.CharField(max_length=12, default="#7A8F6B")
    currency = models.CharField(max_length=8, default="PHP")
    timezone = models.CharField(max_length=64, default="Asia/Manila")
    delivery_enabled = models.BooleanField(default=False)
    reservation_enabled = models.BooleanField(default=False)
    senior_pwd_discount_enabled = models.BooleanField(default=False)
    senior_pwd_percent = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    senior_pwd_food_qty = models.PositiveIntegerField(default=1)
    senior_pwd_drink_qty = models.PositiveIntegerField(default=1)
    loyalty_enabled = models.BooleanField(default=False)
    sms_notifications_enabled = models.BooleanField(default=False)
    advanced_loyalty_campaigns_enabled = models.BooleanField(default=False)
    inventory_enabled = models.BooleanField(default=False)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    service_fee_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pickup_slot_minutes = models.PositiveIntegerField(default=15)
    loyalty_price_cap = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    loyalty_expiry_days = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Business Settings"
        verbose_name_plural = "Business Settings"

    def __str__(self):
        return self.business_name

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class PromoCode(models.Model):
    class DiscountType(models.TextChoices):
        PERCENT = "percent", "Percent"
        FIXED = "fixed", "Fixed"

    code = models.CharField(max_length=40, unique=True)
    discount_type = models.CharField(max_length=10, choices=DiscountType.choices, default=DiscountType.PERCENT)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class AuditLog(models.Model):
    actor = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="audit_logs")
    action = models.CharField(max_length=80)
    target_type = models.CharField(max_length=80, blank=True)
    target_id = models.CharField(max_length=80, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} {self.target_type}:{self.target_id}"
