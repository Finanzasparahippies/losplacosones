from rest_framework import serializers
from .models import Product, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'stock']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_data = serializers.JSONField(write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total', 'status', 'payment_method', 'delivery_address', 'items', 'items_data', 'created_at']
        read_only_fields = ['user', 'total', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items_data')
        user = self.context['request'].user
        
        # Calculate total
        total = 0
        for item in items_data:
            product = Product.objects.get(id=item['product'])
            total += product.price * item['quantity']
        
        order = Order.objects.create(user=user, total=total, **validated_data)
        
        for item in items_data:
            product = Product.objects.get(id=item['product'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price
            )
        
        return order
