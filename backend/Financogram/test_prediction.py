#!/usr/bin/env python3
"""
Test script for the Stock Prediction Django app
Run this script to test the prediction functionality
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Financogram.settings')
django.setup()

def test_prediction_api():
    """Test the prediction API endpoints"""
    base_url = "http://localhost:8000/prediction"
    
    print("🧪 Testing Stock Prediction API")
    print("=" * 50)
    
    try:
        # Test 1: Get available stocks
        print("\n1. Testing GET /prediction/stocks/")
        response = requests.get(f"{base_url}/stocks/")
        if response.status_code == 200:
            stocks = response.json()['stocks']
            print(f"✅ Success! Found {len(stocks)} stocks")
            print(f"   Sample stocks: {', '.join(stocks[:5])}")
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
        
        # Test 2: Get stock info
        print("\n2. Testing GET /prediction/stock/AAPL/info/")
        response = requests.get(f"{base_url}/stock/AAPL/info/")
        if response.status_code == 200:
            stock_info = response.json()
            print(f"✅ Success! AAPL current price: ${stock_info['current_price']}")
            print(f"   Change: {stock_info['price_change']} ({stock_info['price_change_pct']}%)")
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
        
        # Test 3: Generate prediction
        print("\n3. Testing POST /prediction/predict/")
        prediction_data = {
            "symbol": "AAPL",
            "timeframe": "1d"
        }
        response = requests.post(f"{base_url}/predict/", json=prediction_data)
        if response.status_code == 200:
            prediction = response.json()
            print(f"✅ Success! Generated prediction for {prediction['symbol']}")
            print(f"   Trend: {prediction['trend_direction']}")
            print(f"   Confidence: {prediction['confidence_score']:.1%}")
            print(f"   Recommendation: {prediction['recommendation']}")
            print(f"   Expected Return: {prediction['expected_return']}%")
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        # Test 4: Get prediction history
        print("\n4. Testing GET /prediction/history/AAPL/")
        response = requests.get(f"{base_url}/history/AAPL/")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ Success! Found {len(history)} prediction records")
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
        
        # Test 5: Download CSV
        print("\n5. Testing GET /prediction/download/AAPL/1d/")
        response = requests.get(f"{base_url}/download/AAPL/1d/")
        if response.status_code == 200:
            print(f"✅ Success! CSV download working")
            print(f"   Content-Type: {response.headers.get('content-type')}")
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
        
        print("\n🎉 All tests passed! The prediction API is working correctly.")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Django server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_prediction_engine():
    """Test the prediction engine directly"""
    print("\n🧪 Testing Prediction Engine Directly")
    print("=" * 50)
    
    try:
        from prediction.prediction_engine import StockPredictionEngine, AVAILABLE_STOCKS
        
        print(f"✅ Prediction engine imported successfully")
        print(f"✅ Available stocks: {len(AVAILABLE_STOCKS)} stocks")
        
        # Test with a simple stock
        engine = StockPredictionEngine()
        print(f"✅ Engine initialized successfully")
        
        # Note: This would require internet connection and may take time
        print("⚠️  Note: Full prediction test requires internet connection and may take 10-15 seconds")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Engine test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Stock Prediction System Test Suite")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test API endpoints
    api_success = test_prediction_api()
    
    # Test prediction engine
    engine_success = test_prediction_engine()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    print(f"API Tests: {'✅ PASSED' if api_success else '❌ FAILED'}")
    print(f"Engine Tests: {'✅ PASSED' if engine_success else '❌ FAILED'}")
    
    if api_success and engine_success:
        print("\n🎉 All tests passed! Your prediction system is ready to use.")
        print("\nNext steps:")
        print("1. Start your React frontend: npm start")
        print("2. Navigate to the Prediction page")
        print("3. Select a stock and generate predictions!")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        print("\nTroubleshooting:")
        print("1. Make sure Django server is running: python manage.py runserver")
        print("2. Check if all dependencies are installed: pip install -r requirements.txt")
        print("3. Verify database migrations: python manage.py migrate")

if __name__ == "__main__":
    main()
