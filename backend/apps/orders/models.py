import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone


class Order(models.Model):
    class OrderType(models.TextChoices):
        PICKUP = "pickup", "Pickup"
        DELIVERY = "delivery", "Delivery"
        DINE_IN = "dine_in", "Dine In"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        AWAITING_PAYMENT = "awaiting_payment", "Awaiting Payment Verification"
        PAID = "paid", "Paid"
        CONFIRMED = "confirmed", "Confirmed"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready for Pickup"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        REJECTED = "rejected", "Rejected"

    class PaymentMethod(models.TextChoices):
        GCASH = "gcash", "GCash"
        MAYA = "maya", "Maya"
        BANK = "bank", "Bank Transfer"
        CASH = "cash", "Cash"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PENDING_VERIFICATION = "pending_verification", "Pending Verification"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    order_code = models.CharField(max_length=12, unique=True, editable=False)
    customer_name = models.CharField(max_length=120)
    customer_mobile = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True)
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.PICKUP)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_address = models.TextField(blank=True)
    pickup_time = models.CharField(max_length=20, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    reward_redemption_type = models.CharField(max_length=20, default="none")
    senior_pwd_applied = models.BooleanField(default=False)
    promo_code = models.CharField(max_length=40, blank=True)
    promo_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="orders_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_code:
            self.order_code = uuid.uuid4().hex[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_code


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("menu.Product", null=True, blank=True, on_delete=models.SET_NULL)
    product_name = models.CharField(max_length=120)
    size = models.ForeignKey("menu.ProductSize", null=True, blank=True, on_delete=models.SET_NULL)
    size_name = models.CharField(max_length=40, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    hot_iced = models.CharField(max_length=20, blank=True)
    milk = models.CharField(max_length=40, blank=True)
    sugar = models.CharField(max_length=40, blank=True)
    addons = models.JSONField(default=list, blank=True)
    customizations = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    is_stamp_eligible = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
