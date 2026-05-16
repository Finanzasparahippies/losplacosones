from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, IngredientViewSet, geocode_proxy, reverse_geocode_proxy

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'ingredients', IngredientViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('geocode/', geocode_proxy, name='geocode-proxy'),
    path('reverse-geocode/', reverse_geocode_proxy, name='reverse-geocode-proxy'),
]
