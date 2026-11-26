from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderStatusHistory
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.core.permissions import IsStaffRole, IsManagerOrOwner


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related("items")
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "payment_status", "payment_method"]

    def get_permissions(self):
        if self.action in ("create", "track"):
            return [permissions.AllowAny()]
        if self.action in ("list", "retrieve", "update", "partial_update", "transition"):
            return [IsStaffRole()]
        return [IsManagerOrOwner()]

    def create(self, request, *args, **kwargs):
        ser = OrderCreateSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        order = ser.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def transition(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        valid = [c[0] for c in Order.Status.choices]
        if new_status not in valid:
            return Response({"detail": "Invalid status"}, status=400)
        old = order.status
        order.status = new_status
        if new_status == Order.Status.CANCELLED:
            order.cancellation_reason = request.data.get("reason", "")
            from apps.loyalty.services import restore_stars
            restore_stars(order)
            from apps.inventory.services import restore_for_order
            restore_for_order(order)
        order.save()
        # earn stars on completion
        if new_status == Order.Status.COMPLETED:
            from apps.loyalty.services import earn_stars
            eligible_qty = sum(i.quantity for i in order.items.filter(is_stamp_eligible=True))
            earn_stars(order.created_by, order, eligible_qty)
            from apps.core.models import BusinessSettings
            if BusinessSettings.get().inventory_enabled:
                from apps.inventory.services import deduct_for_order
                deduct_for_order(order)
            # deduct redeemed stars
            if order.reward_redemption_type in ("half_off", "free_drink"):
                from apps.loyalty.models import RewardRedemption, LoyaltyAccount
                rr = order.reward_redemptions.filter(status="pending").first()
                if rr:
                    rr.status = "completed"
                    rr.save(update_fields=["status"])
            # qr claim not duplicate? handled
        # reservations/tables not in scope here
        OrderStatusHistory.objects.create(order=order, from_status=old, to_status=new_status, changed_by=request.user, note=request.data.get("note", ""))
        if order.created_by:
            from apps.notifications.models import Notification
            from apps.notifications.services import notify

            if new_status == Order.Status.CANCELLED:
                body = order.cancellation_reason or "Your order was cancelled."
            elif new_status == Order.Status.READY:
                body = "Your order is ready for pickup."
            elif new_status == Order.Status.COMPLETED:
                body = "Thank you — we hope you enjoyed it."
            else:
                body = "Your order status has been updated."
            notify(
                order.created_by,
                Notification.Event.ORDER_STATUS,
                f"Order {order.order_code}: {order.get_status_display()}",
                body,
                url=f"/order/{order.order_code}",
                dedupe_key=f"order-status:{order.pk}:{new_status}",
            )
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_orders(self, request):
        qs = Order.objects.prefetch_related("items").filter(created_by=request.user).order_by("-created_at")
        return Response(OrderSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def track(self, request):
        code = request.query_params.get("code")
        if not code:
            return Response({"detail": "code required"}, status=400)
        try:
            order = Order.objects.prefetch_related("items").get(order_code=code.upper())
        except Order.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        return Response(OrderSerializer(order).data)
