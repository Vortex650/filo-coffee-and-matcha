import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError
from django.utils import timezone

from apps.accounts.models import User

from .models import Notification, NotificationPreference

logger = logging.getLogger(__name__)

STAFF_ROLES = (User.Role.OWNER, User.Role.MANAGER, User.Role.CASHIER, User.Role.BARISTA)


def _preferences_for(user):
    prefs, _ = NotificationPreference.objects.get_or_create(user=user)
    return prefs


def _send_email(user, title, body):
    """Inert until an email provider is configured. Failures never block the app."""
    if not getattr(settings, "NOTIFICATIONS_EMAIL_ENABLED", False):
        return
    if not user.email:
        return
    try:
        send_mail(
            subject=title,
            message=body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:  # pragma: no cover - defensive
        logger.exception("Notification email failed for %s", user.pk)


def notify(user, event, title, body="", url="", dedupe_key=None):
    """Create an in-app notification. Never raises into the calling flow."""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        prefs = _preferences_for(user)
        if not prefs.in_app_enabled:
            return None
        if dedupe_key and Notification.objects.filter(dedupe_key=dedupe_key).exists():
            return None
        notification = Notification.objects.create(
            recipient=user,
            event=event,
            title=title,
            body=body,
            url=url,
            dedupe_key=dedupe_key,
        )
    except IntegrityError:
        return None
    except Exception:  # pragma: no cover - defensive
        logger.exception("Could not create notification for %s", getattr(user, "pk", None))
        return None

    if prefs.email_enabled:
        _send_email(user, title, body)
    return notification


def notify_staff(event, title, body="", url="", dedupe_key_prefix=None, roles=STAFF_ROLES):
    """Notify every active staff member in the given roles."""
    try:
        staff = User.objects.filter(is_active=True, role__in=roles)
    except Exception:  # pragma: no cover - defensive
        logger.exception("Could not load staff for notification")
        return
    for user in staff:
        key = f"{dedupe_key_prefix}:{user.pk}" if dedupe_key_prefix else None
        notify(user, event, title, body=body, url=url, dedupe_key=key)


def mark_read(notification):
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at"])
    return notification
