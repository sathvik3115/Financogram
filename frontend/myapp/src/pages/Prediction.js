import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ApexCharts from 'apexcharts';
import { Container, Row, Col, Form, Button, Alert, Badge } from 'react-bootstrap';
import { 
  FaChartLine, FaRobot, FaDownload, FaInfoCircle, FaArrowUp, 
  FaArrowDown, FaMinus, FaShieldAlt, FaBrain, FaCheckCircle, FaExclamationTriangle,
  FaSpinner, FaSearch, FaCalendarAlt, FaMoneyBillWave, FaHistory
} from 'react-icons/fa';

const Prediction = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartInstance, setChartInstance] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const chartRef = useRef(null);

  const timeframes = [
    { value: '1d', label: '1 Day', days: 1 },
    { value: '1w', label: '1 Week', days: 7 },
    { value: '1m', label: '1 Month', days: 30 }
  ];

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    if (prediction && chartRef.current) {
      renderChart();
    }
  }, [prediction]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockInfo();
      fetchPredictionHistory();
    }
  }, [selectedStock]);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/prediction/stocks/`);
      setStocks(response.data.stocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Failed to fetch available stocks');
    }
  };

  const fetchStockInfo = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/prediction/stock/${selectedStock}/info/`);
      setStockInfo(response.data);
    } catch (error) {
      console.error('Error fetching stock info:', error);
      setStockInfo(null);
    }
  };

  const fetchPredictionHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/prediction/history/${selectedStock}/`);
      setPredictionHistory(response.data);
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      setPredictionHistory([]);
    }
  };

  const handlePrediction = async () => {
    if (!selectedStock) {
      setError('Please select a stock');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/prediction/predict/`, {
        symbol: selectedStock,
        timeframe: selectedTimeframe
      });

      setPrediction(response.data);
    } catch (error) {
      console.error('Error generating prediction:', error);
      
      let errorMessage = 'Failed to generate prediction';
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData?.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += ` (Details: ${JSON.stringify(errorData.details)})`;
          }
        } else {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = `Request error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!prediction || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance) {
      chartInstance.destroy();
    }

    const historicalData = prediction.historical_data;
    const predictedData = prediction.predicted_data;

    // Combine historical and predicted data
    const allDates = [...historicalData.dates, ...predictedData.dates];
    const allPrices = [...historicalData.prices, ...predictedData.prices];

    // Create series data
    const historicalSeries = historicalData.prices.map((price, index) => ({
      x: new Date(historicalData.dates[index]).getTime(),
      y: price
    }));

    const predictedSeries = predictedData.prices.map((price, index) => ({
      x: new Date(predictedData.dates[index]).getTime(),
      y: price
    }));

    const options = {
      series: [
        {
          name: 'Historical',
          data: historicalSeries,
          color: '#00bfff'
        },
        {
          name: 'Predicted',
          data: predictedSeries,
          color: prediction.trend_direction === 'UP' ? '#00ff99' : '#ff4d4d'
        }
      ],
      chart: {
        type: 'line',
        height: 500,
        background: 'transparent',
        toolbar: {
          show: false,
          // tools: {
          //   download: true,
          //   selection: true,
          //   zoom: true,
          //   zoomin: true,
          //   zoomout: true,
          //   pan: true,
          //   reset: true
          // }
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
      stroke: {
        curve: 'smooth',
        width: 3,
        lineCap: 'round'
      },
      xaxis: {
        type: 'datetime',
        labels: {
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
          formatter: (val) => `$${val.toFixed(2)}`,
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
          formatter: (val) => `$${val.toFixed(2)}`
        },
        marker: {
          show: false
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: {
          colors: '#cccccc'
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
      },
      theme: {
        mode: 'dark'
      }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
    setChartInstance(chart);
  };

  const downloadXLSX = async () => {
    if (!prediction) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/prediction/download/${prediction.symbol}/${prediction.timeframe}/`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${prediction.symbol}_${prediction.timeframe}_prediction.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading XLSX:', error);
      setError('Failed to download prediction data');
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY': return 'success';
      case 'SELL': return 'danger';
      case 'HOLD': return 'warning';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'UP': return <FaArrowUp className="text-success" />;
      case 'DOWN': return <FaArrowDown className="text-danger" />;
      case 'SIDEWAYS': return <FaMinus className="text-warning" />;
      default: return <FaMinus className="text-secondary" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const formatTimeframe = (timeframe) => {
    const tf = timeframes.find(t => t.value === timeframe);
    return tf ? tf.label : timeframe;
  };

  return (
    <div className="prediction-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .prediction-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .prediction-container::before {
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

        .prediction-container > * {
          position: relative;
          z-index: 2;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00ff99, #00bfff);
        }

        /* Header Section */
        .prediction-header {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(0, 191, 255, 0.2);
          padding: 2rem 0;
          margin-bottom: 2rem;
        }

        .header-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(45deg, #00bfff, #00ff99, #ff4d4d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          animation: titleGlow 2s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .page-subtitle {
          color: #cccccc;
          font-size: 1.2rem;
          font-weight: 300;
          margin-bottom: 1.5rem;
        }

        /* Control Panel */
        .control-panel {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          margin-bottom: 2rem;
        }

        .form-control, .form-select {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          color: #ffffff;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
          transform: scale(1.02);
        }

        .form-control::placeholder {
          color: #888888;
        }

        .predict-btn {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border: none;
          border-radius: 15px;
          padding: 1rem 2rem;
          color: #000;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .predict-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .predict-btn:hover::before {
          left: 100%;
        }

        .predict-btn:hover {
          background: linear-gradient(45deg, #00ff99, #00bfff);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .predict-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Stock Info Section */
        .stock-info-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          margin-bottom: 2rem;
        }

        .stock-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stock-info-item {
          text-align: center;
          padding: 1rem;
          background: rgba(0, 191, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(0, 191, 255, 0.3);
        }

        .stock-info-label {
          font-size: 0.9rem;
          color: #888888;
          margin-bottom: 0.5rem;
        }

        .stock-info-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #00bfff;
        }

        /* Results Section */
        .results-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          margin-bottom: 2rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .insight-card {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 1.5rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.5);
        }

        .insight-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .insight-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #00bfff;
        }

        .insight-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .insight-description {
          font-size: 0.9rem;
          color: #cccccc;
        }

        /* Chart Container */
        .chart-container {
          background: rgba(26, 26, 26, 0.5);
          border-radius: 15px;
          padding: 1rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          margin-bottom: 2rem;
        }

        /* History Section */
        .history-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          margin-bottom: 2rem;
        }

        .history-item {
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .history-item:hover {
          transform: translateX(5px);
          border-color: rgba(0, 191, 255, 0.5);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .history-timeframe {
          font-size: 0.9rem;
          color: #888888;
        }

        .history-date {
          font-size: 0.8rem;
          color: #666666;
        }

        /* Download Section */
        .download-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .download-btn {
          background: linear-gradient(45deg, #00ff99, #00bfff);
          border: none;
          border-radius: 15px;
          padding: 0.75rem 1.5rem;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 255, 153, 0.3);
          color: #000;
          text-decoration: none;
        }

        /* Loading Animation */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #cccccc;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(0, 191, 255, 0.3);
          border-top: 4px solid #00bfff;
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
          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }

          .control-panel, .results-section {
            padding: 1.5rem;
          }

          .insights-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .chart-container {
            padding: 0.5rem;
          }

          .stock-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .page-title {
            font-size: 1.5rem;
          }

          .control-panel, .results-section {
            padding: 1rem;
          }

          .insight-card {
            padding: 1rem;
          }

          .stock-info-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Floating Animation */
        .floating {
          animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Header Section */}
      <div className="prediction-header">
        <div className="header-content">
          <h1 className="page-title floating">
            <FaRobot className="me-3" />
            AI Stock Prediction
          </h1>
          <p className="page-subtitle">
            Advanced machine learning algorithms to predict stock prices with high accuracy
          </p>
        </div>
      </div>

      <Container>
        {/* Control Panel */}
        <div className="control-panel">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-light">
                  <FaSearch className="me-2" />
                  Select Stock
                </Form.Label>
                <Form.Select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                >
                  <option value="">Choose a stock...</option>
                  {stocks.map((stock) => (
                    <option key={stock} value={stock}>{stock}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-light">
                  <FaCalendarAlt className="me-2" />
                  Prediction Timeframe
                </Form.Label>
                <Form.Select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  {timeframes.map((tf) => (
                    <option key={tf.value} value={tf.value}>{tf.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                className="predict-btn w-100"
                onClick={handlePrediction}
                disabled={loading || !selectedStock}
              >
                {loading ? (
                  <>
                    <FaSpinner className="fa-spin me-2" />
                    Generating Prediction...
                  </>
                ) : (
                  <>
                    <FaBrain className="me-2" />
                    Generate Prediction
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </div>

        {/* Stock Info Section */}
        {stockInfo && (
          <div className="stock-info-section">
            <h5 className="mb-3">
              <FaInfoCircle className="me-2" />
              Current Stock Information for {stockInfo.symbol}
            </h5>
            <div className="stock-info-grid">
              <div className="stock-info-item">
                <div className="stock-info-label">Current Price</div>
                <div className="stock-info-value">${stockInfo.current_price}</div>
              </div>
              <div className="stock-info-item">
                <div className="stock-info-label">Change</div>
                <div className={`stock-info-value ${stockInfo.price_change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stockInfo.price_change >= 0 ? '+' : ''}{stockInfo.price_change} ({stockInfo.price_change_pct}%)
                </div>
              </div>
              <div className="stock-info-item">
                <div className="stock-info-label">Volume</div>
                <div className="stock-info-value">{stockInfo.volume.toLocaleString()}</div>
              </div>
              <div className="stock-info-item">
                <div className="stock-info-label">52W High</div>
                <div className="stock-info-value">${stockInfo.high_52w}</div>
              </div>
              <div className="stock-info-item">
                <div className="stock-info-label">52W Low</div>
                <div className="stock-info-value">${stockInfo.low_52w}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h4>AI is analyzing market data...</h4>
            <p>This may take a few moments</p>
          </div>
        )}

        {/* Results Section */}
        {prediction && !loading && (
          <div className="results-section">
            <h3 className="mb-4">
              <FaChartLine className="me-2" />
              Prediction Results for {prediction.symbol}
            </h3>

            {/* Insights Grid */}
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">
                  <FaArrowUp />
                </div>
                <div className="insight-title">Trend Direction</div>
                <div className="insight-value">
                  {getTrendIcon(prediction.trend_direction)}
                  {prediction.trend_direction}
                </div>
                <div className="insight-description">
                  Predicted market movement
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <FaShieldAlt />
                </div>
                <div className="insight-title">Model Confidence</div>
                <div className={`insight-value text-${getConfidenceColor(prediction.confidence_score)}`}>
                  {(prediction.confidence_score * 100).toFixed(1)}%
                </div>
                <div className="insight-description">
                  AI model confidence level
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <FaCheckCircle />
                </div>
                <div className="insight-title">Recommendation</div>
                <div className={`insight-value`}>
                  <Badge bg={getRecommendationColor(prediction.recommendation)} className="fs-5">
                    {prediction.recommendation}
                  </Badge>
                </div>
                <div className="insight-description">
                  Investment advice
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="insight-title">Expected Return</div>
                <div className={`insight-value ${prediction.expected_return >= 0 ? 'text-success' : 'text-danger'}`}>
                  {prediction.expected_return >= 0 ? '+' : ''}{prediction.expected_return}%
                </div>
                <div className="insight-description">
                  Predicted price change
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="chart-container">
              <div ref={chartRef}></div>
            </div>

            {/* Download Section */}
            <div className="download-section">
              <Row className="align-items-center">
                <Col md={8}>
                  <h5 className="mb-2">
                    <FaDownload className="me-2" />
                    Download Prediction Data
                  </h5>
                  <p className="mb-0 text-light opacity-50">
                    Get detailed prediction results in XLSX format for further analysis
                  </p>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    className="download-btn"
                    onClick={downloadXLSX}
                  >
                    <FaDownload />
                    Download Excelsheet
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        )}

        {/* Prediction History Section */}
        {predictionHistory.length > 0 && (
          <div className="history-section">
            <h5 className="mb-3">
              <FaHistory className="me-2" />
              Recent Predictions for {selectedStock}
            </h5>
            {predictionHistory.slice(0, 5).map((hist, index) => (
              <div key={index} className="history-item">
                <div className="history-header">
                  <div>
                    <strong>{formatTimeframe(hist.timeframe)}</strong>
                    <span className="ms-3">
                      <Badge bg={getRecommendationColor(hist.recommendation)}>
                        {hist.recommendation}
                      </Badge>
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="history-timeframe">
                      {getTrendIcon(hist.trend_direction)} {hist.trend_direction}
                    </div>
                    <div className="history-date">
                      {new Date(hist.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="row text-center">
                  <div className="col-4">
                    <small className="text-primary fs-5"><b>Confidence</b></small>
                    <div>{(hist.confidence_score * 100).toFixed(1)}%</div>
                  </div>
                  <div className="col-4">
                    <small className="text-primary fs-5"><b>Return</b></small>
                    <div className={hist.expected_return >= 0 ? 'text-success' : 'text-danger'}>
                      {hist.expected_return >= 0 ? '+' : ''}{hist.expected_return}%
                    </div>
                  </div>
                  <div className="col-4">
                    <small className="text-primary fs-5"><b>Model</b></small>
                    <div>{hist.model_used}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Prediction;