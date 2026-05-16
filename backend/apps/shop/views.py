import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['GET'])
@permission_classes([AllowAny])
def geocode_proxy(request):
    query = request.GET.get('q')
    if not query:
        return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Optimizamos para Phoenix, Arizona:
    # countrycodes=us (EE.UU.)
    # viewbox=-112.32,33.29,-111.92,33.81 (Área metropolitana de Phoenix)
    # bounded=1 (Prioriza resultados dentro del área)
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=5&addressdetails=1&countrycodes=us&viewbox=-112.32,33.29,-111.92,33.81&bounded=1"
    headers = {'User-Agent': 'LosPlacosones-App/1.0'}
    
    try:
        response = requests.get(url, headers=headers)
        return Response(response.json())
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def reverse_geocode_proxy(request):
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    if not lat or not lon:
        return Response({'error': 'Missing coordinates'}, status=status.HTTP_400_BAD_REQUEST)
    
    # También pedimos detalles en la búsqueda inversa
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&addressdetails=1"
    headers = {'User-Agent': 'LosPlacosones-App/1.0'}
    
    try:
        response = requests.get(url, headers=headers)
        return Response(response.json())
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
