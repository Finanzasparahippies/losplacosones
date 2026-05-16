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

from datetime import datetime, timedelta
from apps.shop.models import Order, Product, Ingredient
from .models import Expense, FinancialTarget
from django.utils import timezone

class AnalyticsOverview(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Date range for charts (Last 30 days)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # 2. Financial Metrics
        paid_orders = Order.objects.filter(status='PAID')
        gross_sales = paid_orders.aggregate(Sum('total'))['total__sum'] or 0
        
        # Calculate production costs (COGS - Cost of Goods Sold)
        total_production_cost = 0
        for order in paid_orders:
            for item in order.items.all():
                total_production_cost += item.product.get_cost() * item.quantity
        
        # Operational Expenses
        total_expenses = Expense.objects.filter(date__range=[start_date, end_date]).aggregate(Sum('amount'))['amount__sum'] or 0
        
        net_profit = float(gross_sales) - float(total_production_cost) - float(total_expenses)
        
        # 3. Inventory Intelligence
        total_inventory_value = sum(ing.unit_cost * ing.stock for ing in Ingredient.objects.all())
        low_stock_ingredients = Ingredient.objects.filter(stock__lt=10).count() # Example threshold
        
        # 4. Chart Data (Daily Sales)
        daily_stats = []
        for i in range(30):
            date = start_date + timedelta(days=i)
            day_orders = paid_orders.filter(created_at__date=date.date())
            day_sales = day_orders.aggregate(Sum('total'))['total__sum'] or 0
            daily_stats.append({
                'date': date.strftime('%d %b'),
                'sales': float(day_sales),
                'orders': day_orders.count()
            })
            
        metrics = {
            'financials': {
                'gross_sales': float(gross_sales),
                'total_costs': float(total_production_cost) + float(total_expenses),
                'net_profit': net_profit,
                'margin': (net_profit / float(gross_sales) * 100) if gross_sales > 0 else 0
            },
            'inventory': {
                'total_value': float(total_inventory_value),
                'low_stock_count': low_stock_ingredients,
                'total_products': Product.objects.count()
            },
            'charts': {
                'daily_sales': daily_stats
            },
            'status': 'success'
        }
        return Response(metrics)

import psutil
import time
from django.db import connection

class SystemMetricsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # CPU Metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            cpu_count = psutil.cpu_count(logical=True)

            # Memory Metrics
            mem = psutil.virtual_memory()
            mem_total_gb = mem.total / (1024 ** 3)
            mem_used_gb = mem.used / (1024 ** 3)
            mem_percent = mem.percent

            # Disk Metrics
            disk = psutil.disk_usage('/')
            disk_total_gb = disk.total / (1024 ** 3)
            disk_used_gb = disk.used / (1024 ** 3)
            disk_percent = disk.percent

            # Database Connection Test
            db_status = "Desconectado"
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    row = cursor.fetchone()
                    if row:
                        db_status = "Conectado"
            except Exception:
                db_status = "Error"

            # Uptime (approximate boot time)
            boot_time = datetime.fromtimestamp(psutil.boot_time())
            uptime = datetime.now() - boot_time
            uptime_str = str(uptime).split('.')[0] # Remove microseconds

            metrics = {
                'cpu': {
                    'percent': cpu_percent,
                    'cores': cpu_count
                },
                'memory': {
                    'total_gb': round(mem_total_gb, 2),
                    'used_gb': round(mem_used_gb, 2),
                    'percent': mem_percent
                },
                'disk': {
                    'total_gb': round(disk_total_gb, 2),
                    'used_gb': round(disk_used_gb, 2),
                    'percent': disk_percent
                },
                'database': {
                    'status': db_status
                },
                'system': {
                    'uptime': uptime_str
                }
            }
            return Response(metrics)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
