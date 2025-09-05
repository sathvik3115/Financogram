// StockMarket.js
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Container,
  Row,
  Col
} from 'react-bootstrap'
import ApexCharts from 'apexcharts'
import IndicesBar from './IndicesBar'
import {
  FaSearch,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle,
  FaStar,
  FaMoneyBillWave,
  FaGlobe,
  FaCalendarAlt,
  FaChartBar,
  FaSpinner
} from 'react-icons/fa'

const timeRanges = ['1d', '5d', '1mo', '6mo', 'ytd', '1y', '5y', 'max']

const StockMarket = () => {
  const [stocks, setStocks] = useState([])
  const [search, setSearch] = useState('')
  const [filteredStocks, setFilteredStocks] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('5d')
  const [chartMeta, setChartMeta] = useState(null)
  const [stockDetails, setStockDetails] = useState(null)
  const [isLoadingStocks, setIsLoadingStocks] = useState(true)
  const [cacheStatus, setCacheStatus] = useState('')
  const [chartKey, setChartKey] = useState(0)
  const chartInstanceRef = useRef(null)

  // Function to clear cache
  const clearStockCache = () => {
    localStorage.removeItem('stockMarketCache')
    setCacheStatus('Cache cleared')
    setTimeout(() => setCacheStatus(''), 2000)
  }

  const fetchStocks = async () => {
    try {
      setIsLoadingStocks(true)

      // Check cache first
      const cachedData = localStorage.getItem('stockMarketCache')
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        const now = Date.now()
        const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds

        // If cache is less than 1 hour old, use it
        if (now - timestamp < oneHour) {
          setStocks(data)
          setFilteredStocks(data)
          setIsLoadingStocks(false)
          setCacheStatus('Loaded from cache')
          setTimeout(() => setCacheStatus(''), 2000)
          return
        }
      }

      // Fetch fresh data if cache is expired or doesn't exist
      const res = await axios.get('http://localhost:8000/web/stocks/')
      const stockData = res.data

      // Store in cache with timestamp
      const cacheData = {
        data: stockData,
        timestamp: Date.now()
      }
      localStorage.setItem('stockMarketCache', JSON.stringify(cacheData))

      setStocks(stockData)
      setFilteredStocks(stockData)
      setCacheStatus('Fresh data loaded')
      setTimeout(() => setCacheStatus(''), 2000)
    } catch (error) {
      console.error('Failed to fetch stocks:', error)

      // If API fails, try to use cached data even if expired
      const cachedData = localStorage.getItem('stockMarketCache')
      if (cachedData) {
        const { data } = JSON.parse(cachedData)
        setStocks(data)
        setFilteredStocks(data)
      }
    } finally {
      setIsLoadingStocks(false)
    }
  }

  const fetchStockChart = React.useCallback(
    async (symbol, period = selectedPeriod) => {
      setLoading(true)
      try {
        const res = await axios.get(
          `http://localhost:8000/web/stocks/${symbol}/chart/?period=${period}`
        )
        setChartData(res.data)

        const prices = res.data.prices
        const change = prices[prices.length - 1] - prices[0]
        const percent = (change / prices[0]) * 100
        setChartMeta({
          current: prices[prices.length - 1],
          change,
          percent
        })
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    },
    [selectedPeriod]
  )

  // Function to handle stock selection
  const handleStockSelect = (stock) => {
    // Increment chart key to force re-render
    setChartKey(prev => prev + 1)
    setSelectedStock(stock)
    fetchStockChart(stock.symbol)
  }

  const handleSearch = e => {
    const query = e.target.value
    setSearch(query)
    setFilteredStocks(
      stocks.filter(
        stock =>
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(query.toLowerCase())
      )
    )
  }

  useEffect(() => {
    fetchStocks()
  }, [])

  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      const defaultStock = stocks.find(stock => stock.symbol === 'AAPL')
      if (defaultStock) {
        setSelectedStock(defaultStock)
        fetchStockChart('AAPL')
      }
    }
  }, [stocks, fetchStockChart, selectedStock])

  useEffect(() => {
    if (selectedStock) {
      fetchStockChart(selectedStock.symbol)
    }
  }, [selectedPeriod, fetchStockChart, selectedStock])

  useEffect(() => {
    if (selectedStock) {
      axios
        .get(
          `http://localhost:8000/web/stocks/${selectedStock.symbol}/details/`
        )
        .then(res => setStockDetails(res.data))
        .catch(err => console.error('Failed to fetch stock details', err))
    }
  }, [selectedStock])

  // Cleanup effect to destroy chart when component unmounts
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy()
        } catch (error) {
          console.warn('Error destroying chart on unmount:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (chartData && selectedStock) {
      // Use setTimeout to ensure DOM is ready
      const timer = setTimeout(() => {
        const chartEl = document.getElementById(`stockChart-${chartKey}`)
        if (!chartEl) return

        // Destroy previous chart instance if it exists
        if (chartInstanceRef.current) {
          try {
            chartInstanceRef.current.destroy()
          } catch (error) {
            console.warn('Error destroying previous chart:', error)
          }
          chartInstanceRef.current = null
        }

        const isPositive =
          chartData.prices[chartData.prices.length - 1] >= chartData.prices[0]
        const lineColor = isPositive ? '#00ff99' : '#ff4d4d'

        const options = {
          chart: {
            type: 'line',
            height: 400,
            background: 'transparent',
            toolbar: {
              show: false
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
              animateGradually: {
                enabled: true,
                delay: 150
              },
              dynamicAnimation: {
                enabled: true,
                speed: 350
              }
            }
          },
          series: [
            {
              name: selectedStock.symbol,
              data: chartData.prices
            }
          ],
          xaxis: {
            categories: chartData.dates,
            tickAmount: 6,
            labels: {
              rotate: -45,
              style: {
                colors: '#cccccc',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
              }
            },
            axisBorder: {
              show: true,
              color: '#333333'
            },
            axisTicks: {
              show: true,
              color: '#333333'
            }
          },
          yaxis: {
            labels: {
              formatter: val => `₹${val.toFixed(2)}`,
              style: {
                colors: '#cccccc',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
              }
            },
            axisBorder: {
              show: true,
              color: '#333333'
            },
            axisTicks: {
              show: true,
              color: '#333333'
            }
          },
          colors: [lineColor],
          theme: { mode: 'dark' },
          stroke: {
            curve: 'smooth',
            width: 3,
            lineCap: 'round'
          },
          grid: {
            borderColor: '#333333',
            strokeDashArray: 5,
            xaxis: {
              lines: {
                show: true,
                color: '#222222'
              }
            },
            yaxis: {
              lines: {
                show: true,
                color: '#222222'
              }
            }
          },
          tooltip: {
            theme: 'dark',
            style: {
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif'
            },
            y: {
              formatter: val => `₹${val.toFixed(2)}`
            },
            marker: {
              show: false
            }
          },
          dataLabels: {
            enabled: false
          },
          markers: {
            size: 0,
            hover: {
              size: 6,
              sizeOffset: 3
            }
          }
        }

        try {
          const chart = new ApexCharts(chartEl, options)
          chart.render()
          chartInstanceRef.current = chart
        } catch (error) {
          console.error('Error creating chart:', error)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [chartData, selectedStock, chartKey])

  return (
    <div className='stock-market-container'>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .stock-market-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .stock-market-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(0, 191, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 77, 77, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }

        .stock-market-container > * {
          position: relative;
          z-index: 2;
        }

        .page-header {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(0, 191, 255, 0.2);
          padding: 1rem 0;
          margin-bottom: 1rem;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          animation: titleGlow 2s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .header-subtitle {
          color: #cccccc;
          font-size: 1rem;
          font-weight: 300;
        }

        .main-content1 {
          padding: 1rem 0;
        }

        .stocks-panel {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          height: 80vh;
          overflow-y: auto;
        }

        .stocks-panel::-webkit-scrollbar {
          width: 5px;
        }

        .stocks-panel::-webkit-scrollbar-track {
          background: rgba(26, 26, 26, 0.5);
          border-radius: 10px;
        }

        .stocks-panel::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-radius: 10px;
        }

        .stocks-panel::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00ff99, #00bfff);
        }

        .search-input {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 0.75rem 1rem 0.75rem 3rem;
          color: #ffffff;
          font-size: 1rem;
          width: 100%;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          margin-bottom: 1.5rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
          transform: scale(1.02);
        }

        .search-input::placeholder {
          color: #888888;
        }

        .search-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .cache-status {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 255, 153, 0.2));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 0.3rem 0.8rem;
          color: #00bfff;
          font-size: 0.8rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          animation: fadeInOut 2s ease-in-out;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(-10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }

        .cache-status-container{
          padding: 1rem;
          position: absolute;
          display: flex;
          flex-direction: row;
          gap: 1rem;
          top: 0;
          right: 0;
        }

        .clear-cache-btn {
          background: linear-gradient(135deg, rgba(255, 77, 77, 0.2), rgba(255, 107, 107, 0.2));
          border: 1px solid rgba(255, 77, 77, 0.3);
          border-radius: 15px;
          padding: 0.3rem 0.8rem;
          color: #ff4d4d;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .clear-cache-btn:hover {
          background: linear-gradient(135deg, rgba(255, 77, 77, 0.3), rgba(255, 107, 107, 0.3));
          transform: translateY(-2px);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 30%;
          transform: translateY(-30%);
          color: #00bfff;
          font-size: 1.1rem;
          z-index: 2;
        }

        .stock-item {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .stock-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.5);
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 255, 153, 0.2));
        }

        .stock-item.selected {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          .stock-symbol{ color: #000; }
          .stock-name{ color: #000; }
          .stock-price{ color: darkgreen; }
          border-color: #00ff99;
        }

        .stock-symbol {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .stock-name {
          color: #cccccc;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stock-price {
          font-weight: 600;
          font-size: 1rem;
          color: #00ff99;
        }

        .chart-panel {
          min-height: auto;
          height: auto;
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .stock-title {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffffff;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 15px;
          font-weight: 600;
          font-size: 1rem;
        }

        .price-change.positive {
          background: linear-gradient(135deg, rgba(0, 255, 153, 0.2), rgba(0, 191, 255, 0.2));
          color: #00ff99;
          border: 1px solid rgba(0, 255, 153, 0.3);
        }

        .price-change.negative {
          background: linear-gradient(135deg, rgba(255, 77, 77, 0.2), rgba(255, 107, 107, 0.2));
          color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.3);
        }

        .time-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .time-btn {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 25px;
          padding: 0.5rem 1.2rem;
          color: #00bfff;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .time-btn:hover,
        .time-btn.active {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
        }

        .details-panel {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          height: 80vh;
          overflow-y: auto;
        }

        .details-panel::-webkit-scrollbar {
          width: 5px;
        }

        .details-panel::-webkit-scrollbar-track {
          background: rgba(26, 26, 26, 0.5);
          border-radius: 10px;
        }

        .details-panel::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-radius: 10px;
        }

        .details-panel::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00ff99, #00bfff);
        }

        .detail-section {
          margin-bottom: 1.0rem;
        }

        .detail-title {
          color: #00bfff;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-value {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 500;
        }

        .tags-section {
          margin-bottom: 1.5rem;
        }

        .tag {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 255, 153, 0.2));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 0.3rem 0.8rem;
          color: #00bfff;
          font-size: 0.8rem;
          font-weight: 500;
          margin: 0.2rem;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .tag:hover {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          transform: scale(1.05);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          color: #cccccc;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(0, 191, 255, 0.3);
          border-top: 3px solid #00bfff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }


        /* Responsive Design */
    @media (max-width: 768px) {
          .header-title {
            font-size: 1.5rem;
          }

          .stocks-panel,
          .details-panel {
            height: 400px;
            margin-bottom: 1rem;
          }

          .chart-panel{
            min-height: auto;
            margin-bottom: 1rem;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .price-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .time-buttons {
            width: 100%;
            justify-content: center;
          }

          .time-btn {
            font-size: 0.8rem;
            padding: 0.4rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .header-title {
            font-size: 1.3rem;
          }

          .stock-title {
            font-size: 1.2rem;
          }

          .current-price {
            font-size: 1.5rem;
          }

          .chart-panel,
          .stocks-panel,
          .details-panel {
            padding: 1rem;
          }
        }

        /* Enhanced Accessibility */
        .stock-item:focus,
        .time-btn:focus,
        .search-input:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
        }

        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }
    `}</style>

      <div className='page-header'>
        <Container>
          <h1 className='header-title'>Stock Market</h1>
          <p className='header-subtitle'>
            Real-time stock tracking and analysis
          </p>
        </Container>
        <div className='cache-status-container'>
          {cacheStatus && <div className='cache-status'>{cacheStatus}</div>}
          <button
            className='clear-cache-btn'
            onClick={clearStockCache}
            title='Clear cache and reload fresh data'
          >
            Clear Cache
          </button>
        </div>
      </div>

      <IndicesBar />

      <Container fluid className='main-content1 px-5'>
        <Row style={{ minHeight: 'auto' }}>
          <Col lg={3} md={4}>
            <div className='stocks-panel'>
              <div className='search-wrapper'>
                <FaSearch className='search-icon' />
                <input
                  type='text'
                  className='search-input'
                  placeholder='Search stocks...'
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              {isLoadingStocks ? (
                <div className='loading-container'>
                  <FaSpinner
                    className='fa-spin'
                    style={{ fontSize: '2rem', color: '#00bfff' }}
                  />
                  <p>Loading stocks...</p>
                </div>
              ) : (
                <div>
                  {filteredStocks.map((stock, idx) => (
                    <div
                      key={idx}
                      className={`stock-item ${
                        selectedStock?.symbol === stock.symbol ? 'selected' : ''
                      }`}
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className='stock-symbol'>{stock.symbol}</div>
                      <div className='stock-name'>{stock.name}</div>
                      <div className='stock-price'>
                        ₹{stock.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          <Col lg={6} md={8}>
            <div className='chart-panel'>
              {selectedStock ? (
                <>
                  <div className='chart-header'>
                    <h3 className='stock-title'>
                      <FaChartLine />
                      {selectedStock.name} ({selectedStock.symbol})
                    </h3>
                    {chartMeta && (
                      <div className='price-info'>
                        <div className='current-price'>
                          ₹
                          {chartMeta.current.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div
                          className={`price-change ${
                            chartMeta.change >= 0 ? 'positive' : 'negative'
                          }`}
                        >
                          {chartMeta.change >= 0 ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                          {Math.abs(chartMeta.percent).toFixed(2)}%
                          <span style={{ marginLeft: '0.5rem' }}>
                            {chartMeta.change >= 0 ? '+' : ''}
                            {chartMeta.change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='time-buttons'>
                    {timeRanges.map(period => (
                      <button
                        key={period}
                        className={`time-btn ${
                          selectedPeriod === period ? 'active' : ''
                        }`}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className='loading-container'>
                      <FaSpinner
                        className='fa-spin'
                        style={{ fontSize: '2rem', color: '#00bfff' }}
                      />
                      <p>Loading chart data...</p>
                    </div>
                  ) : (
                    <div 
                      id={`stockChart-${chartKey}`} 
                      key={chartKey}
                      style={{ minHeight: '400px', width: '100%' }}
                    ></div>
                  )}
                </>
              ) : (
                <div className='loading-container'>
                  <FaInfoCircle
                    style={{
                      fontSize: '3rem',
                      color: '#888888',
                      marginBottom: '1rem'
                    }}
                  />
                  <h4>Select a stock to view chart</h4>
                  <p>
                    Choose from the list on the left to see detailed analysis
                  </p>
                </div>
              )}
            </div>
          </Col>

          <Col lg={3} md={12}>
            <div className='details-panel'>
              {stockDetails ? (
                <>
                  <div className='tags-section'>
                    <h5 style={{ color: '#00bfff', marginBottom: '1rem' }}>
                      <FaStar /> Tags
                    </h5>
                    <div>
                      {stockDetails.tags.map((tag, idx) => (
                        <span key={idx} className='tag'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaMoneyBillWave /> Previous Close
                    </div>
                    <div className='detail-value'>
                      ₹{stockDetails.previousClose?.toFixed(2)}
                    </div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaChartBar /> Day Range
                    </div>
                    <div className='detail-value'>{stockDetails.dayRange}</div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaCalendarAlt /> Year Range
                    </div>
                    <div className='detail-value'>{stockDetails.yearRange}</div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaGlobe /> Market Cap
                    </div>
                    <div className='detail-value'>
                      {(stockDetails.marketCap / 1e12).toFixed(2)}T INR
                    </div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaChartLine /> Avg. Volume
                    </div>
                    <div className='detail-value'>
                      {(stockDetails.avgVolume / 1e6).toFixed(2)}M
                    </div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaArrowUp /> P/E Ratio
                    </div>
                    <div className='detail-value'>
                      {stockDetails.peRatio?.toFixed(2)}
                    </div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaMoneyBillWave /> Dividend Yield
                    </div>
                    <div className='detail-value'>
                      {stockDetails.dividendYield
                        ? `${(stockDetails.dividendYield * 100).toFixed(2)}%`
                        : '-'}
                    </div>
                  </div>

                  <div className='detail-section'>
                    <div className='detail-title'>
                      <FaGlobe /> Exchange
                    </div>
                    <div className='detail-value'>{stockDetails.exchange}</div>
                  </div>
                </>
              ) : (
                <div className='loading-container'>
                  <FaSpinner
                    className='fa-spin'
                    style={{ fontSize: '2rem', color: '#00bfff' }}
                  />
                  <p>Loading stock details...</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default StockMarket
