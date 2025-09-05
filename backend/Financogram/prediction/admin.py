from django.contrib import admin
from .models import StockPrediction, PredictionCache

@admin.register(StockPrediction)
class StockPredictionAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'timeframe', 'trend_direction', 'confidence_score', 'recommendation', 'created_at')
    list_filter = ('trend_direction', 'recommendation', 'timeframe', 'created_at')
    search_fields = ('symbol',)
    readonly_fields = ('created_at',)

@admin.register(PredictionCache)
class PredictionCacheAdmin(admin.ModelAdmin):
    list_display = ('cache_key', 'expires_at', 'created_at')
    list_filter = ('expires_at', 'created_at')
    search_fields = ('cache_key',)
    readonly_fields = ('created_at',)
