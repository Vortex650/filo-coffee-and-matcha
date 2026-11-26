from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import BusinessSettings, AuditLog
from .serializers import BusinessSettingsSerializer, AuditLogSerializer
from apps.core.permissions import IsManagerOrOwner


class BusinessSettingsViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(BusinessSettingsSerializer(BusinessSettings.get()).data)

    def retrieve(self, request, pk=None):
        return Response(BusinessSettingsSerializer(BusinessSettings.get()).data)

    def partial_update(self, request, pk=None):
        obj = BusinessSettings.get()
        ser = BusinessSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def update(self, request, pk=None):
        obj = BusinessSettings.get()
        ser = BusinessSettingsSerializer(obj, data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsManagerOrOwner()]


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsManagerOrOwner]


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health(request):
    return Response({"status": "ok"})
