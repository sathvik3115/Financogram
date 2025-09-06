import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import os
from dotenv import load_dotenv

load_dotenv()

@api_view(['GET'])
def get_news(request):
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": "sensex",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 100,
        "apiKey": os.getenv.NEWS_API_KEY,  # store in backend
    }
    response = requests.get(url, params=params)
    return JsonResponse(response.json())

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')  # from openrouter.ai

@api_view(['POST'])
def chat(request):
    try:
        message = request.data.get("message", "")

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://127.0.0.1:3000",  # your frontend domain
            "Content-Type": "application/json"
        }

        payload = {
            "model": "mistralai/mistral-7b-instruct",  # Or try: openai/gpt-3.5-turbo, meta-llama/llama-3-8b-instruct
            "messages": [
                {"role": "system", "content": "You are a financial assistant helping users."},
                {"role": "user", "content": message}
            ]
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        data = response.json()

        reply = data["choices"][0]["message"]["content"]
        return Response({"reply": reply})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# views.py
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from rest_framework.decorators import api_view
from rest_framework.response import Response


TOP_STOCKS = [
    'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NFLX', 'NVDA', 'INTC', 'AMD',
    'IBM', 'ORCL', 'SAP', 'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'BIDU', 'SHOP',
    'RELIANCE.BO', 'INFY.BO', 'TCS.BO', 'WIPRO.BO', 'TECHM.BO', 'HCLTECH.BO',
    'HDFCBANK.BO', 'ICICIBANK.BO', 'SBIN.BO', 'AXISBANK.BO', 'KOTAKBANK.BO', 'IDFCFIRSTB.BO',
    'BAJFINANCE.BO', 'BAJAJFINSV.BO', 'HINDUNILVR.BO', 'ITC.BO', 'TITAN.BO', 'LT.BO',
    'MARUTI.BO', 'M&M.BO', 'TATAMOTORS.BO', 'ASHOKLEY.BO', 'HEROMOTOCO.BO', 'EICHERMOT.BO',
    'ONGC.BO', 'GAIL.BO', 'IOC.BO', 'BPCL.BO', 'COALINDIA.BO', 'NTPC.BO', 'POWERGRID.BO',
    'JSWSTEEL.BO', 'TATASTEEL.BO', 'VEDL.BO', 'ADANIENT.BO', 'ADANIPORTS.BO',
    'SUNPHARMA.BO', 'CIPLA.BO', 'DIVISLAB.BO', 'DRREDDY.BO', 'APOLLOHOSP.BO',
    'ASIANPAINT.BO', 'NESTLEIND.BO', 'BRITANNIA.BO', 'DABUR.BO', 'HAVELLS.BO', 'ULTRACEMCO.BO',
    'ZEEL.BO', 'PIDILITIND.BO', 'BERGEPAINT.BO'
]

@api_view(['GET'])
def get_stocks(request):
    def fetch_info(symbol):
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            return {
                'symbol': symbol,
                'name': info.get('shortName', symbol),
                'price': info.get('regularMarketPrice', 0.0)
            }
        except Exception:
            return {
                'symbol': symbol,
                'name': symbol,
                'price': 0.0
            }

    results = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(fetch_info, sym) for sym in TOP_STOCKS]
        for future in as_completed(futures):
            results.append(future.result())

    return Response(results)


@api_view(['GET'])
def get_stock_chart(request, symbol):
    period = request.GET.get("period", "5d")
    interval_map = {
        "1d": "5m",
        "5d": "30m",
        "1mo": "1d",
        "6mo": "1d",
        "ytd": "1d",
        "1y": "1d",
        "5y": "1wk",
        "max": "1mo"
    }
    interval = interval_map.get(period, "30m")

    stock = yf.Ticker(symbol)
    hist = stock.history(period=period, interval=interval)

    dates = hist.index.to_series().dt.strftime("%b %d %H:%M" if interval in ["5m", "15m", "30m"] else "%b %d %Y").tolist()
    prices = hist['Close'].fillna(method='ffill').tolist()

    return Response({'dates': dates, 'prices': prices})


INDICES = {
    "^NSEI": "NIFTY 50",
    "^BSESN": "SENSEX",
    "^NSEBANK": "Nifty Bank",
    "^CNXIT": "Nifty IT",
    "^BSESMCAP": "S&P BSE SmallCap"
}

@api_view(['GET'])
def get_indices(request):
    def fetch_index(symbol, name):
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            current = info.get('regularMarketPrice')
            prev_close = info.get('regularMarketPreviousClose')
            if current and prev_close:
                change = current - prev_close
                percent = (change / prev_close) * 100
                return {
                    'symbol': symbol,
                    'name': name,
                    'value': round(current, 2),
                    'change': round(change, 2),
                    'percent': round(percent, 2)
                }
        except Exception:
            pass
        return None

    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_index, sym, nm): sym for sym, nm in INDICES.items()}
        for future in as_completed(futures):
            result = future.result()
            if result:
                results.append(result)

    return Response(results)


@api_view(['GET'])
def get_stock_details(request, symbol):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info

        data = {
            "previousClose": info.get("previousClose"),
            "dayRange": f"{info.get('dayLow')} – {info.get('dayHigh')}",
            "yearRange": f"{info.get('fiftyTwoWeekLow')} – {info.get('fiftyTwoWeekHigh')}",
            "marketCap": info.get("marketCap"),
            "avgVolume": info.get("averageVolume"),
            "peRatio": info.get("trailingPE"),
            "dividendYield": info.get("dividendYield"),
            "exchange": info.get("exchange"),
            "tags": [
                "Stock",
                "IN listed security" if "NSE" in info.get("exchange", "") else "US listed",
                "IN headquartered" if "India" in info.get("country", "") else "Foreign"
            ]
        }
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# views_mutual_funds.py
import os
import json
from datetime import datetime, timedelta
import concurrent.futures

CACHE_PATH = 'mf_cache.json'
CACHE_EXPIRY_HOURS = 12

def is_cache_valid():
    if not os.path.exists(CACHE_PATH):
        return False
    modified_time = datetime.fromtimestamp(os.path.getmtime(CACHE_PATH))
    return datetime.now() - modified_time < timedelta(hours=CACHE_EXPIRY_HOURS)


def fetch_fund_detail(scheme):
    try:
        detail = requests.get(f"https://api.mfapi.in/mf/{scheme['schemeCode']}").json()
        latest = detail.get('data', [{}])[0]
        return {
            "id": scheme['schemeCode'],
            "name": scheme['schemeName'],
            "nav": float(latest.get('nav', 0)),
            "returns": None,
            "category": detail.get('meta', {}).get('scheme_category'),
            "risk": detail.get('meta', {}).get('risk'),
            "min_investment": 500
        }
    except:
        return None

@api_view(['GET'])
def get_mutual_funds(request):
    if is_cache_valid():
        with open(CACHE_PATH, 'r') as f:
            data = json.load(f)
        return Response(data)

    resp = requests.get('https://api.mfapi.in/mf?limit=200&offset=6')
    all_schemes = resp.json()

    funds = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        results = list(executor.map(fetch_fund_detail, all_schemes))
        # Filter out None results if any failed
        funds = [fund for fund in results if fund is not None]

    with open(CACHE_PATH, 'w') as f:
        json.dump(funds, f)

    return Response(funds)


import requests

@api_view(['GET'])
def get_mutual_fund_details(request, fund_id):
    try:
        detail = requests.get(f"https://api.mfapi.in/mf/{fund_id}").json()
        full_history = detail.get("data", [])  # Don't slice

        if not full_history:
            return Response({"error": "No data found for this fund."}, status=404)

        # Sort in ascending order by date
        sorted_history = sorted(
            full_history,
            key=lambda x: x["date"]
        )

        nav_data = [
            {"date": item["date"], "nav": float(item["nav"])}
            for item in sorted_history if "nav" in item
        ]

        response = {
            "id": fund_id,
            "name": detail.get("meta", {}).get("scheme_name"),
            "category": detail.get("meta", {}).get("scheme_category"),
            "risk": detail.get("meta", {}).get("risk"),
            "nav": float(nav_data[-1]["nav"]) if nav_data else 0,
            "returns": None,
            "historical_nav": nav_data
        }
        return Response(response)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


from .models import Investment
from django.utils import timezone
from django.db import transaction
from api.models import User

@api_view(['POST'])
def save_investment(request):
    try:
        data = request.data

        # Basic validation
        required_fields = ['email', 'fund_id', 'name', 'amount', 'investment_type', 'nav', 'category', 'payment_mode']
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return Response({'error': f"Missing fields: {', '.join(missing)}"}, status=400)

        email = data.get('email')
        payment_mode = data.get('payment_mode')

        try:
            amount = float(data.get('amount'))
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=400)

        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)

        # Fetch user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        # Perform atomic operation for wallet deduction + investment save
        with transaction.atomic():
            new_balance = None
            if payment_mode == 'Wallet':
                try:
                    current_balance = float(user.balance)
                except (TypeError, ValueError):
                    return Response({'error': 'Invalid user balance in system'}, status=500)

                if amount > current_balance:
                    return Response({'error': 'Insufficient wallet balance'}, status=400)

                new_balance = round(current_balance - amount, 2)
                user.balance = f"{new_balance:.2f}"
                user.save(update_fields=['balance'])

            # Create and save investment
            Investment.objects.create(
                email=email,
                fund_id=data.get('fund_id'),
                name=data.get('name'),
                amount=amount,
                sip_date=data.get('sip_date') or 'Not Applicable',
                investment_type=data.get('investment_type'),
                nav=float(data.get('nav')) if data.get('nav') is not None else 0.0,
                category=data.get('category'),
                risk=data.get('risk'),
                payment_mode=payment_mode,
                date=timezone.now().date(),
                time=timezone.now().time()
            )

        response = {'message': 'Investment saved successfully ✅'}
        if payment_mode == 'Wallet':
            response['new_balance'] = float(user.balance)
        return Response(response)

    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
def get_investments(request):
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)

    investments = Investment.objects.filter(email=email)
    serialized = [{
        "fund_id": i.fund_id,
        "name": i.name,
        "amount": i.amount,
        "sip_date": i.sip_date,
        "investment_type": i.investment_type,
        "nav": i.nav,
        "category": i.category,
        "risk": i.risk,
        "payment_mode": i.payment_mode,
        "date": i.date,
        "time": i.time,
    } for i in investments]

    return Response(serialized)
