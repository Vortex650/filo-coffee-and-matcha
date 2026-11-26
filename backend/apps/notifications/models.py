from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Event(models.TextChoices):
        ORDER_PLACED = "order_placed", "Order placed"
        ORDER_STATUS = "order_status", "Order status"
        PAYMENT_SUBMITTED = "payment_submitted", "Payment submitted"
        PAYMENT_APPROVED = "payment_approved", "Payment approved"
        PAYMENT_REJECTED = "payment_rejected", "Payment rejected"
        RESERVATION_SUBMITTED = "reservation_submitted", "Reservation submitted"
        RESERVATION_APPROVED = "reservation_approved", "Reservation approved"
        RESERVATION_REJECTED = "reservation_rejected", "Reservation rejected"
        SYSTEM = "system", "System"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    event = models.CharField(max_length=40, choices=Event.choices, default=Event.SYSTEM)
    title = models.CharField(max_length=160)
    body = models.TextField(blank=True)
    url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    dedupe_key = models.CharField(max_length=160, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.recipient} · {self.title}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference"
    )
    in_app_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=False)
    sms_enabled = models.BooleanField(default=False)
    marketing_opt_in = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notification preferences · {self.user}"
