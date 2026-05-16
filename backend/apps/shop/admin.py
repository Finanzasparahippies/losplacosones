from django.contrib import admin
from .models import Product, Order, Ingredient, ProductIngredient

class ProductIngredientInline(admin.TabularInline):
    model = ProductIngredient
    extra = 1

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit_cost', 'unit', 'stock')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'get_cost_display', 'get_margin_display', 'stock')
    search_fields = ('name',)
    inlines = [ProductIngredientInline]

    def get_cost_display(self, obj):
        return f"${obj.get_cost():.2f}"
    get_cost_display.short_description = 'Costo Producción'

    def get_margin_display(self, obj):
        return f"{obj.get_margin():.1f}%"
    get_margin_display.short_description = 'Margen (%)'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
