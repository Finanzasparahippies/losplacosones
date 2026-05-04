from django.db import models

class VehicleLocation(models.Model):
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Location at {self.updated_at}"

class Stop(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ARRIVED = 'ARRIVED', 'Arrived'
        DEPARTED = 'DEPARTED', 'Departed'

    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'scheduled_time']

    def __str__(self):
        return self.name
