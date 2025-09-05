from rest_framework import serializers
from .models import StockPrediction, PredictionCache


class StockPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPrediction
        fields = '__all__'
        read_only_fields = ('created_at',)


class PredictionCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionCache
        fields = '__all__'
        read_only_fields = ('created_at',)


class PredictionRequestSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=10, required=True)
    timeframe = serializers.ChoiceField(
        choices=[('1d', '1 Day'), ('1w', '1 Week'), ('1m', '1 Month')],
        required=True
    )


class StockListSerializer(serializers.Serializer):
    stocks = serializers.ListField(
        child=serializers.CharField(max_length=10),
        help_text="List of available stock symbols"
    )
