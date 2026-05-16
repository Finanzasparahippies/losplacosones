import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer, ChatMessageSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def change_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status and new_status in dict(Order.Status.choices):
            order.status = new_status
            order.save()
            return Response({'status': order.status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel_order(self, request, pk=None):
        from django.utils import timezone
        import datetime
        order = self.get_object()
        
        # User must own the order
        if order.user != request.user and not request.user.is_staff:
            return Response({'error': 'No permission'}, status=status.HTTP_403_FORBIDDEN)
            
        # Check time limit (4 minutes and 59 seconds max)
        time_diff = timezone.now() - order.created_at
        if time_diff >= datetime.timedelta(minutes=5) and not request.user.is_staff:
            return Response({'error': 'Han pasado más de 4 minutos y 59 segundos desde la creación del pedido.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if order.status == Order.Status.DELIVERED:
            return Response({'error': 'El pedido ya fue entregado.'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = Order.Status.CANCELLED
        order.save()
        return Response({'status': order.status})

    @action(detail=True, methods=['get', 'post'])
    def chat_messages(self, request, pk=None):
        order = self.get_object()
        
        # Security check: Only the order owner or a staff member can access the chat
        if request.user != order.user and not request.user.is_staff:
            return Response({'error': 'No permission to access this chat'}, status=status.HTTP_403_FORBIDDEN)
            
        if request.method == 'GET':
            messages = order.messages.all()
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
            
        if request.method == 'POST':
            # Block new messages if order is Delivered or Cancelled
            if order.status in [Order.Status.DELIVERED, Order.Status.CANCELLED]:
                return Response({'error': 'Chat is closed for this order'}, status=status.HTTP_400_BAD_REQUEST)
                
            serializer = ChatMessageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(order=order, sender=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
