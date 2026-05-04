from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleLocationViewSet, StopViewSet

router = DefaultRouter()
router.register(r'location', VehicleLocationViewSet, basename='location')
router.register(r'stops', StopViewSet, basename='stops')

urlpatterns = [
    path('', include(router.urls)),
]
