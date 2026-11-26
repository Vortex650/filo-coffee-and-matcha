from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include([
        path("core/", include("apps.core.urls")),
        path("accounts/", include("apps.accounts.urls")),
        path("menu/", include("apps.menu.urls")),
        path("orders/", include("apps.orders.urls")),
        path("payments/", include("apps.payments.urls")),
        path("loyalty/", include("apps.loyalty.urls")),
        path("reservations/", include("apps.reservations.urls")),
        path("reports/", include("apps.reports.urls")),
        path("inventory/", include("apps.inventory.urls")),
        path("reviews/", include("apps.reviews.urls")),
        path("notifications/", include("apps.notifications.urls")),
        path("schema/", SpectacularAPIView.as_view(), name="schema"),
        path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
