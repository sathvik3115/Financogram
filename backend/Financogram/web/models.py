from djongo import models
from django.utils import timezone

class Investment(models.Model):
    email = models.EmailField()
    fund_id = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    amount = models.FloatField()
    sip_date = models.CharField(max_length=2 ,default='Not Applicable')
    investment_type = models.CharField(max_length=20)
    nav = models.FloatField()
    category = models.CharField(max_length=255)
    risk = models.CharField(max_length=100, null=True, blank=True)
    payment_mode = models.CharField(max_length=20)
    date = models.DateField(default=timezone.now)
    time = models.TimeField(default=timezone.now)

    def __str__(self):
        return f"{self.email} - {self.fund_id}"
