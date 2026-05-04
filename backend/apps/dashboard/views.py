import pandas as pd
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from apps.shop.models import Order, Product
from apps.newsletter.models import Subscriber
from django.contrib.auth import get_user_model
from django.db.models import Sum

User = get_user_model()

class AnalyticsOverview(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Real Sales Metrics
        paid_orders = Order.objects.filter(status='PAID')
        total_sales = paid_orders.aggregate(Sum('total'))['total__sum'] or 0
        total_orders_count = Order.objects.count()
        
        # 2. Product & Inventory Metrics
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(stock__lt=5).count()
        
        # 3. User & Subscriber Metrics
        total_users = User.objects.count()
        total_subscribers = Subscriber.objects.filter(is_active=True).count()
        
        # 4. Pandas for Daily Stats (Last 30 days)
        # For now, let's keep a simplified version that could be expanded
        metrics = {
            'total_sales': float(total_sales),
            'total_orders': total_orders_count,
            'total_products': total_products,
            'low_stock_count': low_stock_products,
            'total_users': total_users,
            'total_subscribers': total_subscribers,
            'status': 'success'
        }
        
        return Response(metrics)
