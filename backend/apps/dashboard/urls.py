from django.urls import path
from .views import AnalyticsOverview, SystemMetricsView

urlpatterns = [
    path('analytics/', AnalyticsOverview.as_view(), name='analytics-overview'),
    path('system-status/', SystemMetricsView.as_view(), name='system-status'),
]
