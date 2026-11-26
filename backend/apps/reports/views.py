from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
from apps.loyalty.models import LoyaltyTransaction
from apps.core.permissions import IsManagerOrOwner
import csv
from django.http import HttpResponse


class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsManagerOrOwner]

    def _date_range(self, request):
        days = int(request.query_params.get("days", 30))
        end = timezone.now()
        start = end - timedelta(days=days)
        return start, end

    @action(detail=False, methods=["get"])
    def sales(self, request):
        start, end = self._date_range(request)
        qs = Order.objects.filter(created_at__range=(start, end))
        total = qs.aggregate(total_sum=Sum("total"), count=Count("id"), avg_total=Avg("total"))
        by_day = list(qs.annotate(d=TruncDate("created_at")).values("d").annotate(total=Sum("total"), count=Count("id")).order_by("d"))
        return Response({"summary": total, "by_day": by_day})

    @action(detail=False, methods=["get"])
    def products(self, request):
        start, end = self._date_range(request)
        qs = OrderItem.objects.filter(order__created_at__range=(start, end))
        top = list(qs.values("product_name").annotate(qty=Sum("quantity"), revenue=Sum("line_total")).order_by("-qty")[:10])
        return Response({"top_products": top})

    @action(detail=False, methods=["get"])
    def peak_hours(self, request):
        start, end = self._date_range(request)
        qs = Order.objects.filter(created_at__range=(start, end)).annotate(h=TruncHour("created_at")).values("h").annotate(count=Count("id")).order_by("h")
        return Response({"peak_hours": list(qs)})

    @action(detail=False, methods=["get"])
    def payments(self, request):
        start, end = self._date_range(request)
        qs = Order.objects.filter(created_at__range=(start, end)).values("payment_method").annotate(count=Count("id"), total=Sum("total"))
        return Response({"payments": list(qs)})

    @action(detail=False, methods=["get"])
    def loyalty(self, request):
        start, end = self._date_range(request)
        earned = LoyaltyTransaction.objects.filter(created_at__range=(start, end), transaction_type="earned").aggregate(s=Sum("stars"))["s"] or 0
        redeemed = LoyaltyTransaction.objects.filter(created_at__range=(start, end), transaction_type="redeemed").aggregate(s=Sum("stars"))["s"] or 0
        return Response({"stars_issued": earned, "stars_redeemed": abs(redeemed)})

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        start, end = self._date_range(request)
        qs = Order.objects.filter(created_at__range=(start, end))
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=orders.csv"
        w = csv.writer(response)
        w.writerow(["order_code", "customer", "status", "payment", "total", "created_at"])
        for o in qs:
            w.writerow([o.order_code, o.customer_name, o.status, o.payment_method, o.total, o.created_at])
        return response
