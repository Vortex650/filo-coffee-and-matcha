from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from apps.menu.models import Product, ProductSize


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "size", "size_name", "quantity", "unit_price", "line_total", "hot_iced", "milk", "sugar", "addons", "notes", "is_stamp_eligible"]


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    size_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, default=1)
    hot_iced = serializers.CharField(required=False, allow_blank=True, default="")
    milk = serializers.CharField(required=False, allow_blank=True, default="")
    sugar = serializers.CharField(required=False, allow_blank=True, default="")
    addons = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_product_id(self, v):
        if not Product.objects.filter(id=v, is_available=True).exists():
            raise serializers.ValidationError("Product not available")
        return v


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "order_code", "customer_name", "customer_mobile", "customer_email", "order_type", "status", "payment_method", "payment_status", "subtotal", "discount_total", "delivery_fee", "tax_amount", "service_fee", "pickup_time", "total", "notes", "created_at", "updated_at", "items"]


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=120)
    customer_mobile = serializers.CharField(max_length=20)
    customer_email = serializers.EmailField(required=False, allow_blank=True, default="")
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    order_type = serializers.ChoiceField(choices=Order.OrderType.choices, default=Order.OrderType.PICKUP)
    delivery_address = serializers.CharField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = OrderItemCreateSerializer(many=True)
    reward_redemption_type = serializers.ChoiceField(choices=[("none","none"),("half_off","half_off"),("free_drink","free_drink")], default="none")
    senior_pwd_applied = serializers.BooleanField(default=False)
    promo_code = serializers.CharField(required=False, allow_blank=True, default="")
    pickup_time = serializers.CharField(required=False, allow_blank=True, default="")

    def create(self, validated_data):
        from apps.core.models import BusinessSettings
        from apps.loyalty.services import get_or_create_account
        items_data = validated_data.pop("items")
        reward_type = validated_data.pop("reward_redemption_type", "none")
        senior_pwd = validated_data.pop("senior_pwd_applied", False)
        promo_code_str = validated_data.pop("promo_code", "")
        user = self.context.get("request").user if self.context.get("request") else None

        bs = BusinessSettings.get()
        created_by = user if (user and user.is_authenticated) else None
        order = Order.objects.create(**validated_data, created_by=created_by, reward_redemption_type=reward_type, senior_pwd_applied=senior_pwd, promo_code=promo_code_str)
        subtotal = 0
        eligible_drinks = []
        for it in items_data:
            product = Product.objects.get(id=it["product_id"])
            size = None
            size_name = ""
            unit_price = product.base_price
            if it.get("size_id"):
                size = ProductSize.objects.get(id=it["size_id"], product=product)
                size_name = size.name
                unit_price = unit_price + size.price_adjustment
            addons = it.get("addons", [])
            addon_total = sum(a.get("price", 0) for a in addons)
            unit_price = unit_price + addon_total
            qty = it["quantity"]
            line_total = unit_price * qty
            subtotal += line_total
            oi = OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                size=size,
                size_name=size_name,
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
                hot_iced=it.get("hot_iced", ""),
                milk=it.get("milk", ""),
                sugar=it.get("sugar", ""),
                addons=addons,
                notes=it.get("notes", ""),
                is_stamp_eligible=product.is_stamp_eligible,
            )
            if product.is_stamp_eligible:
                eligible_drinks.append(oi)

        # senior/pwd discount
        discount = 0
        if senior_pwd and bs.senior_pwd_discount_enabled:
            # 20% off 1 food + 1 drink: find first food and first eligible drink
            food_item = None
            drink_item = None
            for oi in order.items.all():
                cat = oi.product.category.name.lower() if oi.product else ""
                if "pastr" in cat or "food" in cat:
                    if food_item is None: food_item = oi
                else:
                    if drink_item is None: drink_item = oi
            for oi in [food_item, drink_item]:
                if oi:
                    discount += (oi.unit_price * (bs.senior_pwd_percent / 100))

        # reward redemption discount
        if reward_type == "half_off" and user and user.is_authenticated:
            if get_or_create_account(user).stars >= 5:
                if eligible_drinks:
                    discount += (eligible_drinks[0].unit_price * 0.5)
        elif reward_type == "free_drink" and user and user.is_authenticated:
            if get_or_create_account(user).stars >= 10:
                if eligible_drinks:
                    price = eligible_drinks[0].unit_price
                    cap = bs.loyalty_price_cap
                    discount += price if (cap is None or price <= cap) else cap

        # promo code discount
        promo_discount = 0
        if promo_code_str:
            from apps.core.models import PromoCode
            from django.utils import timezone
            try:
                pc = PromoCode.objects.get(code=promo_code_str, is_active=True)
                if pc.expires_at is None or pc.expires_at >= timezone.now():
                    if pc.max_uses is None or pc.used_count < pc.max_uses:
                        if subtotal >= pc.min_order_total:
                            if pc.discount_type == PromoCode.DiscountType.PERCENT:
                                promo_discount = subtotal * (pc.value / 100)
                            else:
                                promo_discount = pc.value
                            pc.used_count += 1
                            pc.save(update_fields=["used_count"])
            except PromoCode.DoesNotExist:
                pass
        discount += promo_discount
        order.promo_discount = promo_discount

        # delivery fee
        delivery_fee = 0
        if order.order_type == Order.OrderType.DELIVERY:
            if bs.delivery_enabled:
                # flat fee placeholder 50
                delivery_fee = 50
            else:
                raise serializers.ValidationError("Delivery not enabled")

        taxable = subtotal - discount
        tax_amount = taxable * (bs.tax_percent / 100) if bs.tax_percent else 0
        service_fee = taxable * (bs.service_fee_percent / 100) if bs.service_fee_percent else 0

        order.subtotal = subtotal
        order.discount_total = discount
        order.delivery_fee = delivery_fee
        order.tax_amount = tax_amount
        order.service_fee = service_fee
        order.total = taxable + delivery_fee + tax_amount + service_fee

        # cash orders skip payment verification
        if order.payment_method == Order.PaymentMethod.CASH:
            order.payment_status = Order.PaymentStatus.UNPAID
            order.status = Order.Status.PENDING
        else:
            order.payment_status = Order.PaymentStatus.PENDING_VERIFICATION
            order.status = Order.Status.AWAITING_PAYMENT
        order.save()
        # create pending reward redemption record
        if reward_type in ("half_off", "free_drink") and user and user.is_authenticated:
            from apps.loyalty.services import get_or_create_account
            from apps.loyalty.models import RewardRedemption
            acc = get_or_create_account(user)
            stars = 5 if reward_type == "half_off" else 10
            RewardRedemption.objects.create(account=acc, reward_type=reward_type, stars_used=stars, order=order, status="pending")
        OrderStatusHistory.objects.create(order=order, from_status="", to_status=order.status, note="Order created")

        from apps.notifications.models import Notification
        from apps.notifications.services import notify, notify_staff

        notify_staff(
            Notification.Event.ORDER_PLACED,
            f"New order {order.order_code}",
            f"{order.customer_name} · ₱{order.total:,.2f} · {order.get_order_type_display()}",
            url="/admin/orders",
            dedupe_key_prefix=f"order-placed:{order.pk}",
        )
        if created_by:
            notify(
                created_by,
                Notification.Event.ORDER_PLACED,
                f"We received order {order.order_code}",
                "We will keep you posted as it moves along.",
                url=f"/order/{order.order_code}",
                dedupe_key=f"order-received:{order.pk}",
            )
        return order
