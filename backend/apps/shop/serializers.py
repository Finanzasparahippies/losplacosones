from rest_framework import serializers
from .models import Product, Order, OrderItem, ChatMessage, Ingredient, ProductIngredient

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'unit_cost', 'stock']

class ProductIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    unit = serializers.ReadOnlyField(source='ingredient.unit')
    unit_cost = serializers.ReadOnlyField(source='ingredient.unit_cost')

    class Meta:
        model = ProductIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'unit', 'unit_cost', 'quantity']

class ProductSerializer(serializers.ModelSerializer):
    ingredients = ProductIngredientSerializer(many=True, read_only=True)
    cost = serializers.SerializerMethodField()
    margin = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'stock', 'ingredients', 'cost', 'margin']

    def get_cost(self, obj):
        return obj.get_cost()

    def get_margin(self, obj):
        return obj.get_margin()

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_data = serializers.JSONField(write_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Order
        fields = ['id', 'user', 'user_email', 'total', 'status', 'payment_method', 'delivery_address', 'latitude', 'longitude', 'items', 'items_data', 'created_at']
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

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    is_staff = serializers.ReadOnlyField(source='sender.is_staff')

    class Meta:
        model = ChatMessage
        fields = ['id', 'order', 'sender', 'sender_name', 'is_staff', 'message', 'created_at']
        read_only_fields = ['order', 'sender', 'sender_name', 'is_staff', 'created_at']
