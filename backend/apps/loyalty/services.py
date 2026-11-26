from django.db import transaction
from .models import LoyaltyAccount, LoyaltyTransaction, RewardRedemption


def get_or_create_account(user):
    acc, _ = LoyaltyAccount.objects.get_or_create(user=user)
    return acc


def earn_stars(user, order, count):
    if not user or not user.is_authenticated or user.role != "customer":
        return None
    if count <= 0:
        return None
    acc = get_or_create_account(user)
    with transaction.atomic():
        acc.stars += count
        acc.save(update_fields=["stars", "updated_at"])
        LoyaltyTransaction.objects.create(account=acc, transaction_type=LoyaltyTransaction.Type.EARNED, stars=count, order=order, note=f"Earned from order {order.order_code}")
    return acc


def redeem_half_off(user, order):
    # requires >=5 stars
    acc = get_or_create_account(user)
    if acc.stars < 5:
        return None
    with transaction.atomic():
        acc.stars -= 5
        acc.save(update_fields=["stars", "updated_at"])
        RewardRedemption.objects.create(account=acc, reward_type=RewardRedemption.RewardType.HALF_OFF, stars_used=5, order=order, status="pending")
        LoyaltyTransaction.objects.create(account=acc, transaction_type=LoyaltyTransaction.Type.REDEEMED, stars=-5, order=order, note="5 stars for 50% off")
    return acc


def redeem_free_drink(user, order):
    acc = get_or_create_account(user)
    if acc.stars < 10:
        return None
    with transaction.atomic():
        acc.stars -= 10
        acc.save(update_fields=["stars", "updated_at"])
        RewardRedemption.objects.create(account=acc, reward_type=RewardRedemption.RewardType.FREE_DRINK, stars_used=10, order=order, status="pending")
        LoyaltyTransaction.objects.create(account=acc, transaction_type=LoyaltyTransaction.Type.REDEEMED, stars=-10, order=order, note="10 stars for free drink")
    return acc


def restore_stars(order):
    # restore redeemed stars if order cancelled
    for rr in order.reward_redemptions.all():
        if rr.status == "pending":
            acc = rr.account
            with transaction.atomic():
                acc.stars += rr.stars_used
                acc.save(update_fields=["stars", "updated_at"])
                LoyaltyTransaction.objects.create(account=acc, transaction_type=LoyaltyTransaction.Type.RESTORED, stars=rr.stars_used, order=order, note="Restored on cancellation")
                rr.status = "cancelled"
                rr.save(update_fields=["status"])


def claim_qr(order_code, user):
    # validate order paid
    from apps.orders.models import Order
    try:
        order = Order.objects.get(order_code=order_code)
    except Order.DoesNotExist:
        return None, "Order not found"
    if order.payment_status != Order.PaymentStatus.VERIFIED and order.payment_method != "cash":
        # cash orders: allow if completed
        pass
    if order.status != Order.Status.COMPLETED:
        return None, "Order not completed"
    eligible_count = order.items.filter(is_stamp_eligible=True).count()
    # count quantity
    eligible_qty = sum(i.quantity for i in order.items.filter(is_stamp_eligible=True))
    if eligible_qty <= 0:
        return None, "No eligible items"
    # prevent duplicate claim: check existing earned transaction for this order
    if LoyaltyTransaction.objects.filter(order=order, transaction_type=LoyaltyTransaction.Type.EARNED).exists():
        return None, "Already claimed"
    acc = earn_stars(user, order, eligible_qty)
    return acc, "ok"
