from django.db import models
from django.conf import settings


class Table(models.Model):
    class Area(models.TextChoices):
        INDOOR = "indoor", "Indoor"
        OUTDOOR = "outdoor", "Outdoor"

    code = models.CharField(max_length=10, unique=True)
    seats = models.PositiveIntegerField(default=2)
    area = models.CharField(max_length=20, choices=Area.choices, default=Area.INDOOR)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code


class Reservation(models.Model):
    class TableType(models.TextChoices):
        SMALL = "small", "Small (2 seats)"
        LARGE = "large", "Large (4-6 seats)"
        ARRANGEMENT = "arrangement", "Request Arrangement"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    customer_name = models.CharField(max_length=120)
    customer_mobile = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    party_size = models.PositiveIntegerField()
    table_type = models.CharField(max_length=20, choices=TableType.choices)
    area_preference = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    assigned_table = models.ForeignKey(Table, null=True, blank=True, on_delete=models.SET_NULL, related_name="reservations")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
