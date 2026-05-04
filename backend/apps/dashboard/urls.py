from django.urls import path
from .views import AnalyticsOverview

urlpatterns = [
    path('analytics/', AnalyticsOverview.as_view(), name='analytics-overview'),
]
