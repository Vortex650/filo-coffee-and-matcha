from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["product", "rating", "is_published"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Review.objects.select_related("user", "product", "order")
        user = self.request.user
        staff = bool(user and user.is_authenticated and getattr(user, "is_staff_role", False))
        if self.action in ("update", "partial_update", "destroy"):
            return qs if staff else qs.filter(user=user)
        return qs if staff else qs.filter(is_published=True)
