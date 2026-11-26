from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import PaymentMethodConfig, PaymentVerification
from .serializers import PaymentMethodConfigSerializer, PaymentVerificationSerializer
from apps.core.permissions import IsManagerOrOwner
from apps.orders.models import Order


class PaymentMethodConfigViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethodConfig.objects.all()
    serializer_class = PaymentMethodConfigSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]


class PaymentVerificationViewSet(viewsets.ModelViewSet):
    queryset = PaymentVerification.objects.select_related("order").order_by("-submitted_at")
    serializer_class = PaymentVerificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]

    def create(self, request, *args, **kwargs):
        order_code = request.data.get("order_code")
        try:
            order = Order.objects.get(order_code=order_code)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)
        ref = request.data.get("reference_number", "")
        pv, _ = PaymentVerification.objects.update_or_create(
            order=order, defaults={"reference_number": ref, "status": PaymentVerification.Status.PENDING}
        )
        order.payment_status = Order.PaymentStatus.PENDING_VERIFICATION
        order.status = Order.Status.AWAITING_PAYMENT
        order.save(update_fields=["payment_status", "status", "updated_at"])

        from apps.notifications.models import Notification
        from apps.notifications.services import notify, notify_staff

        notify_staff(
            Notification.Event.PAYMENT_SUBMITTED,
            f"Payment proof · {order.order_code}",
            f"{order.customer_name} submitted reference {ref or '—'} for ₱{order.total:,.2f}.",
            url="/admin/orders",
            dedupe_key_prefix=f"payment-submitted:{pv.pk}",
        )
        if order.created_by:
            notify(
                order.created_by,
                Notification.Event.PAYMENT_SUBMITTED,
                "Payment submitted",
                f"We are verifying the payment for order {order.order_code}.",
                url=f"/order/{order.order_code}",
                dedupe_key=f"payment-submitted-customer:{pv.pk}",
            )
        return Response(PaymentVerificationSerializer(pv).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        pv = self.get_object()
        pv.status = PaymentVerification.Status.APPROVED
        pv.verified_by = request.user
        pv.verified_at = timezone.now()
        pv.save()
        order = pv.order
        order.payment_status = Order.PaymentStatus.VERIFIED
        order.status = Order.Status.PAID
        order.save(update_fields=["payment_status", "status", "updated_at"])
        if order.created_by:
            from apps.notifications.models import Notification
            from apps.notifications.services import notify

            notify(
                order.created_by,
                Notification.Event.PAYMENT_APPROVED,
                "Payment verified",
                f"Order {order.order_code} is confirmed and moving ahead.",
                url=f"/order/{order.order_code}",
                dedupe_key=f"payment-approved:{pv.pk}",
            )
        return Response(PaymentVerificationSerializer(pv).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        pv = self.get_object()
        pv.status = PaymentVerification.Status.REJECTED
        pv.verified_by = request.user
        pv.verified_at = timezone.now()
        pv.rejection_reason = request.data.get("reason", "")
        pv.save()
        order = pv.order
        order.payment_status = Order.PaymentStatus.REJECTED
        order.status = Order.Status.REJECTED
        order.save(update_fields=["payment_status", "status", "updated_at"])
        if order.created_by:
            from apps.notifications.models import Notification
            from apps.notifications.services import notify

            reason = pv.rejection_reason or "The payment reference could not be verified."
            notify(
                order.created_by,
                Notification.Event.PAYMENT_REJECTED,
                f"Payment needs attention · {order.order_code}",
                reason,
                url=f"/order/{order.order_code}",
                dedupe_key=f"payment-rejected:{pv.pk}",
            )
        return Response(PaymentVerificationSerializer(pv).data)
