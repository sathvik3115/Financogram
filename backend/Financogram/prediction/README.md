# Stock Prediction Django App

This Django app provides AI-powered stock price prediction functionality using machine learning algorithms.

## Features

- **Stock Price Forecasting**: Predict future stock prices for 1 day, 1 week, and 1 month
- **Trend Prediction**: Predict whether stocks will go UP, DOWN, or SIDEWAYS
- **Return Forecasting**: Calculate expected percentage returns
- **Technical Analysis**: RSI, MACD, Moving Averages, and Volatility indicators
- **Caching System**: 1-hour cache for predictions to improve performance
- **CSV Export**: Download prediction results for further analysis
- **Prediction History**: Track previous predictions for analysis

## API Endpoints

### Stock Data
- `GET /prediction/stocks/` - Get list of available stock symbols
- `GET /prediction/stock/{symbol}/info/` - Get current stock information

### Predictions
- `POST /prediction/predict/` - Generate stock prediction
- `GET /prediction/download/{symbol}/{timeframe}/` - Download prediction as CSV
- `GET /prediction/history/{symbol}/` - Get prediction history

### Cache Management
- `DELETE /prediction/cache/clear/` - Clear expired prediction cache

## Request Format

```json
{
  "symbol": "AAPL",
  "timeframe": "1d"
}
```

## Response Format

```json
{
  "symbol": "AAPL",
  "timeframe": "1d",
  "historical_data": {
    "dates": ["2023-01-01", ...],
    "prices": [150.0, ...]
  },
  "predicted_data": {
    "dates": ["2024-01-01", ...],
    "prices": [155.0, ...]
  },
  "trend_direction": "UP",
  "confidence_score": 0.85,
  "recommendation": "BUY",
  "model_used": "LSTM-Hybrid",
  "current_price": 150.0,
  "predicted_end_price": 155.0,
  "expected_return": 3.33
}
```

## Available Stocks

The app supports predictions for popular stocks including:
- Tech: AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX, AMD, INTC
- Software: CRM, ORCL, ADBE, PYPL
- Transportation: UBER, LYFT
- ETFs: SPY, QQQ, IWM, GLD, SLV, USO, TLT, VTI

## Timeframes

- `1d` - 1 Day prediction
- `1w` - 1 Week prediction  
- `1m` - 1 Month prediction

## Technical Indicators

The prediction engine uses several technical indicators:

1. **RSI (Relative Strength Index)**: Momentum oscillator
2. **MACD**: Trend-following momentum indicator
3. **Moving Averages**: 20-day and 50-day SMAs
4. **Volatility**: 20-day standard deviation
5. **Price Changes**: 1-day, 5-day, and 10-day percentage changes

## ML Model Details

- **Algorithm**: LSTM-Hybrid with technical analysis
- **Features**: Historical prices, technical indicators, volume data
- **Confidence Scoring**: Based on data quality, volatility, and trend consistency
- **Recommendation Engine**: BUY/SELL/HOLD based on confidence and predicted returns

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations**:
   ```bash
   python manage.py makemigrations prediction
   python manage.py migrate
   ```

3. **Start Server**:
   ```bash
   python manage.py runserver
   ```

## Usage Example

```python
import requests

# Generate prediction
response = requests.post('http://localhost:8000/prediction/predict/', {
    'symbol': 'AAPL',
    'timeframe': '1w'
})

prediction = response.json()
print(f"Trend: {prediction['trend_direction']}")
print(f"Confidence: {prediction['confidence_score']}")
print(f"Recommendation: {prediction['recommendation']}")
```

## Caching

Predictions are cached for 1 hour to improve performance. The cache automatically expires and can be manually cleared using the admin interface or API endpoint.

## Error Handling

The app includes comprehensive error handling for:
- Invalid stock symbols
- Network issues with Yahoo Finance
- Insufficient historical data
- ML model failures

## Testing

Run tests with:
```bash
python manage.py test prediction
```

## Admin Interface

Access the admin interface at `/admin/` to:
- View prediction history
- Monitor cache status
- Analyze prediction performance

## Performance Notes

- First prediction for a stock may take 5-10 seconds
- Cached predictions return in <100ms
- Database queries are optimized with proper indexing
- ML calculations are performed asynchronously

## Security

- CORS configured for localhost:3000 (frontend)
- Input validation for all API endpoints
- Rate limiting can be added for production use

## Future Enhancements

- Real-time price updates
- Multiple ML model support
- Portfolio integration
- Advanced technical indicators
- Social sentiment analysis
- Real-time notifications
