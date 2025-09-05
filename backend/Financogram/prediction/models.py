from django.db import models
from django.utils import timezone
import json


class StockPrediction(models.Model):
    TREND_CHOICES = [
        ('UP', 'Up'),
        ('DOWN', 'Down'),
        ('SIDEWAYS', 'Sideways'),
    ]
    
    RECOMMENDATION_CHOICES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('HOLD', 'Hold'),
    ]
    
    TIMEFRAME_CHOICES = [
        ('1d', '1 Day'),
        ('1w', '1 Week'),
        ('1m', '1 Month'),
    ]
    
    symbol = models.CharField(max_length=10)
    timeframe = models.CharField(max_length=2, choices=TIMEFRAME_CHOICES)
    historical_data = models.JSONField()
    predicted_data = models.JSONField()
    trend_direction = models.CharField(max_length=10, choices=TREND_CHOICES)
    confidence_score = models.FloatField()
    recommendation = models.CharField(max_length=4, choices=RECOMMENDATION_CHOICES)
    model_used = models.CharField(max_length=50, default='LSTM-Hybrid')
    current_price = models.FloatField()
    predicted_end_price = models.FloatField()
    expected_return = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['symbol', 'timeframe', 'created_at']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.symbol} - {self.timeframe} - {self.trend_direction}"
    
    def get_historical_dates(self):
        return self.historical_data.get('dates', [])
    
    def get_historical_prices(self):
        return self.historical_data.get('prices', [])
    
    def get_predicted_dates(self):
        return self.predicted_data.get('dates', [])
    
    def get_predicted_prices(self):
        return self.predicted_data.get('prices', [])


class PredictionCache(models.Model):
    cache_key = models.CharField(max_length=255, unique=True)
    cache_data = models.JSONField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.cache_key} - Expires: {self.expires_at}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def get_data(self):
        if not self.is_expired():
            return self.cache_data
        return None
