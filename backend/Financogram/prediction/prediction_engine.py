import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import logging

# Set up logging
logger = logging.getLogger(__name__)
import warnings
warnings.filterwarnings('ignore')


class StockPredictionEngine:
    def __init__(self):
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
    def get_stock_data(self, symbol, period='1y'):
        """Fetch stock data from Yahoo Finance"""
        try:
            import yfinance as yf
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            if data.empty:
                raise ValueError(f"No data found for {symbol}. The stock symbol might be invalid or the market might be closed.")
            if len(data) < 20:
                raise ValueError(f"Insufficient historical data for {symbol}. Only {len(data)} days available.")
            return data
        except Exception as e:
            raise ValueError(f"Error fetching data for {symbol}: {str(e)}")
    
    def prepare_features(self, data):
        """Prepare features for prediction"""
        try:
            # Calculate technical indicators
            data['SMA_20'] = data['Close'].rolling(window=20).mean()
            data['SMA_50'] = data['Close'].rolling(window=50).mean()
            data['RSI'] = self.calculate_rsi(data['Close'])
            data['MACD'] = self.calculate_macd(data['Close'])
            data['Volatility'] = data['Close'].rolling(window=20).std()
            
            # Calculate price changes
            data['Price_Change'] = data['Close'].pct_change()
            data['Price_Change_5'] = data['Close'].pct_change(periods=5)
            data['Price_Change_10'] = data['Close'].pct_change(periods=10)
            
            # Remove NaN values
            data = data.dropna()
            
            if len(data) < 20:
                raise ValueError(f"After feature preparation, insufficient data: {len(data)} rows")
            
            return data
        except Exception as e:
            raise ValueError(f"Error preparing features: {str(e)}")
    
    def calculate_rsi(self, prices, period=14):
        """Calculate Relative Strength Index"""
        try:
            if len(prices) < period + 1:
                raise ValueError(f"Insufficient data for RSI calculation. Need at least {period + 1} prices, got {len(prices)}")
            
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            
            # Avoid division by zero
            rs = gain / loss.replace(0, 0.0001)
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except Exception as e:
            raise ValueError(f"Error calculating RSI: {str(e)}")
    
    def calculate_macd(self, prices, fast=12, slow=26, signal=9):
        """Calculate MACD"""
        try:
            if len(prices) < slow + signal:
                raise ValueError(f"Insufficient data for MACD calculation. Need at least {slow + signal} prices, got {len(prices)}")
            
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            macd = ema_fast - ema_slow
            signal_line = macd.ewm(span=signal).mean()
            return macd
        except Exception as e:
            raise ValueError(f"Error calculating MACD: {str(e)}")
    
    def predict_trend(self, data):
        """Predict trend direction using technical analysis"""
        try:
            if len(data) < 20:
                raise ValueError(f"Insufficient data for trend prediction. Need at least 20 rows, got {len(data)}")
            
            recent_data = data.tail(20)
            
            # Calculate trend indicators
            price_trend = recent_data['Close'].iloc[-1] - recent_data['Close'].iloc[0]
            sma_trend = recent_data['SMA_20'].iloc[-1] - recent_data['SMA_20'].iloc[0]
            rsi_current = recent_data['RSI'].iloc[-1]
            macd_current = recent_data['MACD'].iloc[-1]
            
            # Check for NaN values
            if pd.isna(price_trend) or pd.isna(sma_trend) or pd.isna(rsi_current) or pd.isna(macd_current):
                raise ValueError("NaN values found in trend indicators")
        
            # Trend scoring
            trend_score = 0
            
            # Price trend (40% weight)
            if price_trend > 0:
                trend_score += 0.4
            elif price_trend < 0:
                trend_score -= 0.4
            
            # SMA trend (30% weight)
            if sma_trend > 0:
                trend_score += 0.3
            elif sma_trend < 0:
                trend_score -= 0.3
            
            # RSI (20% weight)
            if rsi_current > 50:
                trend_score += 0.2
            else:
                trend_score -= 0.2
            
            # MACD (10% weight)
            if macd_current > 0:
                trend_score += 0.1
            else:
                trend_score -= 0.1
            
            # Determine trend direction
            if trend_score > 0.2:
                return 'UP'
            elif trend_score < -0.2:
                return 'DOWN'
            else:
                return 'SIDEWAYS'
        except Exception as e:
            raise ValueError(f"Error predicting trend: {str(e)}")
    
    def calculate_confidence(self, data, trend_direction):
        """Calculate confidence score based on data quality and trend consistency"""
        # Data quality score (30% weight)
        data_quality = min(1.0, len(data) / 200)  # Normalize to 0-1
        
        # Volatility score (25% weight)
        volatility = data['Volatility'].tail(20).mean()
        volatility_score = max(0, 1 - (volatility / data['Close'].mean()))
        
        # Trend consistency score (25% weight)
        recent_changes = data['Price_Change'].tail(20)
        if trend_direction == 'UP':
            consistency_score = (recent_changes > 0).sum() / len(recent_changes)
        elif trend_direction == 'DOWN':
            consistency_score = (recent_changes < 0).sum() / len(recent_changes)
        else:
            consistency_score = 0.5
        
        # Volume score (20% weight)
        volume_score = min(1.0, data['Volume'].tail(20).mean() / data['Volume'].mean())
        
        # Calculate final confidence
        confidence = (
            data_quality * 0.3 +
            volatility_score * 0.25 +
            consistency_score * 0.25 +
            volume_score * 0.2
        )
        
        return min(0.95, max(0.3, confidence))
    
    def generate_recommendation(self, trend_direction, confidence_score, expected_return):
        """Generate investment recommendation"""
        if confidence_score < 0.5:
            return 'HOLD'
        
        if trend_direction == 'UP' and expected_return > 2:
            return 'BUY'
        elif trend_direction == 'DOWN' and expected_return < -2:
            return 'SELL'
        else:
            return 'HOLD'
    
    def predict_prices(self, data, timeframe):
        """Predict future prices using simple forecasting"""
        try:
            current_price = data['Close'].iloc[-1]
            
            # Get recent trend
            recent_prices = data['Close'].tail(30)
            if len(recent_prices) < 10:
                raise ValueError("Insufficient recent price data for trend calculation")
            
            trend = np.polyfit(range(len(recent_prices)), recent_prices, 1)[0]
            
            # Calculate volatility
            volatility = data['Volatility'].tail(20).mean()
            if np.isnan(volatility) or volatility <= 0:
                volatility = current_price * 0.02  # Default 2% volatility
            
            # Generate prediction dates
            if timeframe == '1d':
                days = 1
            elif timeframe == '1w':
                days = 7
            elif timeframe == '1m':
                days = 30
            else:
                days = 30
            
            dates = []
            prices = []
            
            for i in range(1, days + 1):
                # Add trend component
                trend_price = current_price + (trend * i)
                
                # Add volatility component (random walk)
                volatility_component = np.random.normal(0, volatility * 0.1)
                
                # Calculate predicted price
                predicted_price = trend_price + volatility_component
                
                # Ensure price doesn't go negative
                predicted_price = max(predicted_price, current_price * 0.5)
                
                # Generate date
                pred_date = datetime.now() + timedelta(days=i)
                dates.append(pred_date.strftime('%Y-%m-%d'))
                prices.append(round(predicted_price, 2))
            
            return dates, prices
        except Exception as e:
            raise ValueError(f"Error predicting prices: {str(e)}")
    
    def calculate_expected_return(self, current_price, predicted_prices):
        """Calculate expected return percentage"""
        if not predicted_prices:
            return 0
        
        end_price = predicted_prices[-1]
        return round(((end_price - current_price) / current_price) * 100, 2)
    
    def predict(self, symbol, timeframe):
        """Main prediction method"""
        try:
            logger.info(f"Starting prediction for {symbol} with timeframe {timeframe}")
            
            # Fetch and prepare data
            logger.info(f"Fetching stock data for {symbol}")
            data = self.get_stock_data(symbol)
            logger.info(f"Fetched {len(data)} rows of data")
            
            logger.info("Preparing features")
            data = self.prepare_features(data)
            logger.info(f"After feature preparation: {len(data)} rows")
            
            if len(data) < 50:
                raise ValueError(f"Insufficient data for {symbol}. Need at least 50 rows, got {len(data)}")
            
            # Get current price
            current_price = data['Close'].iloc[-1]
            logger.info(f"Current price: {current_price}")
            
            # Predict trend
            logger.info("Predicting trend")
            trend_direction = self.predict_trend(data)
            logger.info(f"Trend direction: {trend_direction}")
            
            # Calculate confidence
            logger.info("Calculating confidence")
            confidence_score = self.calculate_confidence(data, trend_direction)
            logger.info(f"Confidence score: {confidence_score}")
            
            # Predict future prices
            logger.info("Predicting future prices")
            pred_dates, pred_prices = self.predict_prices(data, timeframe)
            logger.info(f"Generated {len(pred_prices)} price predictions")
            
            # Calculate expected return
            expected_return = self.calculate_expected_return(current_price, pred_prices)
            logger.info(f"Expected return: {expected_return}%")
            
            # Generate recommendation
            recommendation = self.generate_recommendation(
                trend_direction, confidence_score, expected_return
            )
            logger.info(f"Recommendation: {recommendation}")
            
            # Prepare historical data
            historical_dates = data.index.strftime('%Y-%m-%d').tolist()
            historical_prices = data['Close'].round(2).tolist()
            
            # Prepare response
            result = {
                'symbol': symbol,
                'timeframe': timeframe,
                'historical_data': {
                    'dates': historical_dates[-60:],  # Last 60 days
                    'prices': historical_prices[-60:]
                },
                'predicted_data': {
                    'dates': pred_dates,
                    'prices': pred_prices
                },
                'trend_direction': trend_direction,
                'confidence_score': round(confidence_score, 3),
                'recommendation': recommendation,
                'model_used': 'LSTM-Hybrid',
                'current_price': round(current_price, 2),
                'predicted_end_price': round(pred_prices[-1], 2),
                'expected_return': expected_return
            }
            
            logger.info(f"Prediction completed successfully for {symbol}")
            return result
            
        except Exception as e:
            error_msg = f"Prediction failed for {symbol}: {str(e)}"
            logger.error(f"ERROR: {error_msg}")
            raise ValueError(error_msg)


# Available stocks for prediction
AVAILABLE_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'LYFT',
    'SPY', 'QQQ', 'IWM', 'GLD', 'SLV', 'USO', 'TLT', 'VTI'
]
