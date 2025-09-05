from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import StockPrediction, PredictionCache
from .prediction_engine import StockPredictionEngine, AVAILABLE_STOCKS
import pandas as pd


class StockPredictionModelTest(TestCase):
    def setUp(self):
        self.prediction_data = {
            'symbol': 'AAPL',
            'timeframe': '1d',
            'historical_data': {'dates': ['2023-01-01'], 'prices': [150.0]},
            'predicted_data': {'dates': ['2023-01-02'], 'prices': [155.0]},
            'trend_direction': 'UP',
            'confidence_score': 0.85,
            'recommendation': 'BUY',
            'model_used': 'LSTM-Hybrid',
            'current_price': 150.0,
            'predicted_end_price': 155.0,
            'expected_return': 3.33
        }
    
    def test_create_prediction(self):
        prediction = StockPrediction.objects.create(**self.prediction_data)
        self.assertEqual(prediction.symbol, 'AAPL')
        self.assertEqual(prediction.trend_direction, 'UP')
        self.assertEqual(prediction.confidence_score, 0.85)
    
    def test_prediction_string_representation(self):
        prediction = StockPrediction.objects.create(**self.prediction_data)
        expected = "AAPL - 1d - UP"
        self.assertEqual(str(prediction), expected)


class PredictionCacheModelTest(TestCase):
    def setUp(self):
        from django.utils import timezone
        from datetime import timedelta
        
        self.cache_data = {
            'cache_key': 'AAPL_1d',
            'cache_data': {'test': 'data'},
            'expires_at': timezone.now() + timedelta(hours=1)
        }
    
    def test_create_cache(self):
        cache = PredictionCache.objects.create(**self.cache_data)
        self.assertEqual(cache.cache_key, 'AAPL_1d')
        self.assertFalse(cache.is_expired())


class PredictionEngineTest(TestCase):
    def setUp(self):
        self.engine = StockPredictionEngine()
    
    def test_available_stocks(self):
        self.assertIn('AAPL', AVAILABLE_STOCKS)
        self.assertIn('MSFT', AVAILABLE_STOCKS)
        self.assertIn('GOOGL', AVAILABLE_STOCKS)
    
    def test_rsi_calculation(self):
        prices = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113]
        rsi = self.engine.calculate_rsi(pd.Series(prices))
        self.assertIsNotNone(rsi.iloc[-1])
    
    def test_macd_calculation(self):
        prices = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113]
        macd = self.engine.calculate_macd(pd.Series(prices))
        self.assertIsNotNone(macd.iloc[-1])


class PredictionAPITest(APITestCase):
    def test_get_available_stocks(self):
        url = reverse('prediction:available_stocks')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stocks', response.data)
        self.assertIn('AAPL', response.data['stocks'])
    
    def test_generate_prediction_invalid_symbol(self):
        url = reverse('prediction:generate_prediction')
        data = {'symbol': 'INVALID', 'timeframe': '1d'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_generate_prediction_invalid_timeframe(self):
        url = reverse('prediction:generate_prediction')
        data = {'symbol': 'AAPL', 'timeframe': 'invalid'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_download_csv_invalid_symbol(self):
        url = reverse('prediction:download_csv', kwargs={'symbol': 'INVALID', 'timeframe': '1d'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# Note: These tests are basic and don't test the actual ML prediction functionality
# In a real production environment, you would want to mock the yfinance calls
# and test the prediction logic with sample data
