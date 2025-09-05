from django.urls import path
from . import views

app_name = 'prediction'

urlpatterns = [
    # Stock data endpoints
    path('stocks/', views.get_available_stocks, name='available_stocks'),
    path('stock/<str:symbol>/info/', views.get_stock_info, name='stock_info'),
    
    # Prediction endpoints
    path('predict/', views.generate_prediction, name='generate_prediction'),
    path('download/<str:symbol>/<str:timeframe>/', views.download_prediction_xlsx, name='download_csv'),
    path('history/<str:symbol>/', views.get_prediction_history, name='prediction_history'),
    
    # Cache management
    path('cache/clear/', views.clear_prediction_cache, name='clear_cache'),
]
