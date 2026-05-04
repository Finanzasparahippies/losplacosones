from django.contrib import admin
from .models import VehicleLocation, Stop

@admin.register(VehicleLocation)
class VehicleLocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'latitude', 'longitude', 'updated_at')

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'status', 'order')
    list_filter = ('status',)
    search_fields = ('name', 'address')
