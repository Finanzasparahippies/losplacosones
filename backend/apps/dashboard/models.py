from django.db import models

class Expense(models.Model):
    class Category(models.TextChoices):
        SUPPLIES = 'SUPPLIES', 'Insumos/Materia Prima'
        GAS = 'GAS', 'Gasolina/Mantenimiento'
        SALARY = 'SALARY', 'Sueldos/Personal'
        MARKETING = 'MARKETING', 'Publicidad'
        OTHER = 'OTHER', 'Otros'

    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.SUPPLIES)
    date = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - ${self.amount}"

class FinancialTarget(models.Model):
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.DateField()
    
    def __str__(self):
        return f"Target for {self.month.strftime('%B %Y')}"
