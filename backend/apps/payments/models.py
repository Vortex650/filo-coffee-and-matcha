from django.db import models


class PaymentMethodConfig(models.Model):
    class Method(models.TextChoices):
        GCASH = "gcash", "GCash"
        MAYA = "maya", "Maya"
        BANK = "bank", "Bank Transfer"
        CASH = "cash", "Cash"

    method = models.CharField(max_length=20, choices=Method.choices, unique=True)
    is_enabled = models.BooleanField(default=True)
    account_name = models.CharField(max_length=120, blank=True)
    account_number = models.CharField(max_length=80, blank=True)
    instructions = models.TextField(blank=True)
    qr_image_url = models.URLField(blank=True)
    requires_verification = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "method"]

    def __str__(self):
        return self.get_method_display()


class PaymentVerification(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    order = models.OneToOneField("orders.Order", on_delete=models.CASCADE, related_name="payment_verification")
    reference_number = models.CharField(max_length=80, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL)
    verified_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.order.order_code} - {self.status}"
