from django.db import models
from django.conf import settings


class LoyaltyAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loyalty")
    stars = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.stars} stars"


class LoyaltyTransaction(models.Model):
    class Type(models.TextChoices):
        EARNED = "earned", "Earned"
        REDEEMED = "redeemed", "Redeemed"
        ADJUSTED = "adjusted", "Adjusted"
        RESTORED = "restored", "Restored"

    account = models.ForeignKey(LoyaltyAccount, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=20, choices=Type.choices)
    stars = models.IntegerField()
    order = models.ForeignKey("orders.Order", null=True, blank=True, on_delete=models.SET_NULL, related_name="loyalty_transactions")
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class RewardRedemption(models.Model):
    class RewardType(models.TextChoices):
        HALF_OFF = "half_off", "50% off one drink"
        FREE_DRINK = "free_drink", "Free drink"

    account = models.ForeignKey(LoyaltyAccount, on_delete=models.CASCADE, related_name="redemptions")
    reward_type = models.CharField(max_length=20, choices=RewardType.choices)
    stars_used = models.PositiveIntegerField()
    order = models.ForeignKey("orders.Order", null=True, blank=True, on_delete=models.SET_NULL, related_name="reward_redemptions")
    status = models.CharField(max_length=20, default="pending")  # pending/completed/cancelled
    created_at = models.DateTimeField(auto_now_add=True)
