from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Table, Reservation
from .serializers import TableSerializer, ReservationSerializer
from apps.core.permissions import IsManagerOrOwner, IsStaffRole


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsManagerOrOwner]


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.AllowAny()]
        if self.action in ("list", "retrieve"):
            return [IsStaffRole()]
        return [IsManagerOrOwner()]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # arrangement always pending
        ser = ReservationSerializer(data=data)
        ser.is_valid(raise_exception=True)
        res = ser.save()
        if request.user.is_authenticated:
            res.created_by = request.user
            res.save(update_fields=["created_by"])
        if res.table_type == Reservation.TableType.ARRANGEMENT:
            res.status = Reservation.Status.PENDING
            res.save(update_fields=["status"])

        from apps.notifications.models import Notification
        from apps.notifications.services import notify, notify_staff

        notify_staff(
            Notification.Event.RESERVATION_SUBMITTED,
            f"New reservation · {res.customer_name}",
            f"{res.date} at {res.time:%H:%M} · {res.party_size} guests",
            url="/admin/reservations",
            dedupe_key_prefix=f"reservation-submitted:{res.pk}",
        )
        if res.created_by:
            notify(
                res.created_by,
                Notification.Event.RESERVATION_SUBMITTED,
                "Reservation received",
                f"We have your request for {res.date} at {res.time:%H:%M} and will confirm shortly.",
                url="/account",
                dedupe_key=f"reservation-received:{res.pk}",
            )
        return Response(ReservationSerializer(res).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsStaffRole])
    def approve(self, request, pk=None):
        r = self.get_object()
        r.status = Reservation.Status.APPROVED
        r.assigned_table_id = request.data.get("table_id", r.assigned_table_id)
        r.save()
        if r.created_by:
            from apps.notifications.models import Notification
            from apps.notifications.services import notify

            notify(
                r.created_by,
                Notification.Event.RESERVATION_APPROVED,
                "Reservation confirmed",
                f"Your table on {r.date} at {r.time:%H:%M} is confirmed. See you soon.",
                url="/account",
                dedupe_key=f"reservation-approved:{r.pk}",
            )
        return Response(ReservationSerializer(r).data)

    @action(detail=True, methods=["post"], permission_classes=[IsStaffRole])
    def reject(self, request, pk=None):
        r = self.get_object()
        r.status = Reservation.Status.REJECTED
        r.save()
        if r.created_by:
            from apps.notifications.models import Notification
            from apps.notifications.services import notify

            notify(
                r.created_by,
                Notification.Event.RESERVATION_REJECTED,
                "Reservation update",
                f"We could not confirm your request for {r.date} at {r.time:%H:%M}. Please contact us and we will find another time.",
                url="/contact",
                dedupe_key=f"reservation-rejected:{r.pk}",
            )
        return Response(ReservationSerializer(r).data)
