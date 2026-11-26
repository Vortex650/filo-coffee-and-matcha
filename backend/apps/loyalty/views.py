from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import LoyaltyAccount, LoyaltyTransaction
from .serializers import LoyaltyAccountSerializer, LoyaltyTransactionSerializer
from apps.core.permissions import IsStaffRole, IsManagerOrOwner
from apps.orders.models import Order


class LoyaltyAccountViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        acc, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        return Response(LoyaltyAccountSerializer(acc).data)

    @action(detail=False, methods=["get"])
    def me(self, request):
        acc, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        return Response(LoyaltyAccountSerializer(acc).data)

    @action(detail=False, methods=["get"])
    def transactions(self, request):
        acc, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        qs = acc.transactions.all()
        return Response(LoyaltyTransactionSerializer(qs, many=True).data)

    @action(detail=False, methods=["post"])
    def claim_qr(self, request):
        from .services import claim_qr
        code = request.data.get("order_code")
        acc, msg = claim_qr(code, request.user)
        if acc is None:
            return Response({"detail": msg}, status=400)
        return Response(LoyaltyAccountSerializer(acc).data)

    @action(detail=False, methods=["post"], permission_classes=[IsStaffRole])
    def counter_claim(self, request):
        # award stars by mobile + order code
        mobile = request.data.get("mobile")
        order_code = request.data.get("order_code")
        from apps.accounts.models import User
        try:
            user = User.objects.get(mobile=mobile, role="customer")
        except User.DoesNotExist:
            return Response({"detail": "Customer not found"}, status=404)
        from apps.orders.models import Order
        try:
            order = Order.objects.get(order_code=order_code)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)
        eligible_qty = sum(i.quantity for i in order.items.filter(is_stamp_eligible=True))
        from .services import earn_stars
        acc = earn_stars(user, order, eligible_qty)
        if acc is None:
            return Response({"detail": "Could not award"}, status=400)
        return Response(LoyaltyAccountSerializer(acc).data)

    @action(detail=False, methods=["post"], permission_classes=[IsManagerOrOwner])
    def adjust(self, request):
        user_id = request.data.get("user_id")
        from apps.accounts.models import User
        user = get_object_or_404(User, id=user_id)
        acc, _ = LoyaltyAccount.objects.get_or_create(user=user)
        delta = int(request.data.get("delta", 0))
        from django.db import transaction
        with transaction.atomic():
            acc.stars = max(0, acc.stars + delta)
            acc.save(update_fields=["stars", "updated_at"])
            LoyaltyTransaction.objects.create(account=acc, transaction_type=LoyaltyTransaction.Type.ADJUSTED, stars=delta, note=request.data.get("note", "Manual adjustment"))
        return Response(LoyaltyAccountSerializer(acc).data)
