from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import VehicleLocation, Stop
from .serializers import VehicleLocationSerializer, StopSerializer

class VehicleLocationViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['update_location']:
            return [IsAdminUser()]
        return [AllowAny()]

    @method_decorator(ensure_csrf_cookie)
    def list(self, request):
        location = VehicleLocation.objects.last()
        if location:
            serializer = VehicleLocationSerializer(location)
            return Response(serializer.data)
        return Response({"detail": "No location found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='update')
    def update_location(self, request):
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if latitude is None or longitude is None:
            return Response({"detail": "Latitude and longitude are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Update or create the singleton location using update_or_create
        # This is more robust against race conditions
        location, created = VehicleLocation.objects.update_or_create(
            id=1,
            defaults={
                'latitude': latitude,
                'longitude': longitude
            }
        )

        serializer = VehicleLocationSerializer(location)
        return Response(serializer.data)

class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
