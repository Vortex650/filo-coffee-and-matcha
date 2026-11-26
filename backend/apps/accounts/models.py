from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        MANAGER = "manager", "Manager"
        CASHIER = "cashier", "Cashier"
        BARISTA = "barista", "Barista"
        CUSTOMER = "customer", "Customer"

    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email or self.username

    @property
    def is_staff_role(self):
        return self.role in {self.Role.OWNER, self.Role.MANAGER, self.Role.CASHIER, self.Role.BARISTA}
