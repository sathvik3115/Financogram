import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import ApexCharts from "apexcharts";
import { Container, Row, Col } from "react-bootstrap";
import { FaChartLine, FaMoneyBillWave, FaArrowUp, FaCheck, FaSpinner, FaCreditCard, FaCalendar } from "react-icons/fa";

const MutualFundDetails = () => {
  const { id } = useParams();
  const [fund, setFund] = useState(null);
  const [timeRange, setTimeRange] = useState("1M");
  const [fullGraphData, setFullGraphData] = useState([]);
  const [chartData, setChartData] = useState({ dates: [], prices: [] });
  const [investmentType, setInvestmentType] = useState("one-time");
  const [isLoading, setIsLoading] = useState(true);
  const [isInvesting, setIsInvesting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    sip_date: "",
    payment_mode: ""
  });

  // Helper: Sort dates properly (DD-MM-YYYY to Date)
  const sortHistoricalData = (data) => {
    return [...data].sort((a, b) => {
      const dateA = moment(a.date, "DD-MM-YYYY");
      const dateB = moment(b.date, "DD-MM-YYYY");
      return dateA - dateB;
    });
  };

  useEffect(() => {
    const fetchFundDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/web/mutual-fund-details/${id}/`);
        const data = await response.json();
        setFund(data);
        const sortedData = sortHistoricalData(data.historical_nav || []);
        setFullGraphData(sortedData);
        handleTimeRangeChange("1M", sortedData);
      } catch (error) {
        console.error('Failed to fetch fund details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFundDetails();
  }, [id]);

  const handleTimeRangeChange = (range, dataFromFetch = null) => {
    const data = dataFromFetch || fullGraphData;
    const sorted = sortHistoricalData(data);
    setTimeRange(range);

    const now = moment();
    let cutoff = null;

    switch (range) {
      case "1M":
        cutoff = now.clone().subtract(1, "months");
        break;
      case "6M":
        cutoff = now.clone().subtract(6, "months");
        break;
      case "YTD":
        cutoff = moment().startOf("year");
        break;
      case "1Y":
        cutoff = now.clone().subtract(1, "years");
        break;
      case "5Y":
        cutoff = now.clone().subtract(5, "years");
        break;
      case "MAX":
      default:
        cutoff = null;
    }

    const filtered = cutoff
      ? sorted.filter((item) => moment(item.date, "DD-MM-YYYY").isAfter(cutoff))
      : sorted;

    const dates = filtered.map((item) => item.date);
    const prices = filtered.map((item) => item.nav);
    setChartData({ dates, prices });
  };

  useEffect(() => {
    if (!chartData || !chartData.prices.length) return;
    const chartEl = document.getElementById("mutualFundChart");
    if (!chartEl) return;
    chartEl.innerHTML = "";

    const isPositive =
      chartData.prices[chartData.prices.length - 1] >= chartData.prices[0];
    const lineColor = isPositive ? "#00ff99" : "#ff4d4d";

    const options = {
      chart: {
        type: "line",
        height: 400,
        background: "transparent",
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
          name: fund?.name || "NAV",
          data: chartData.prices,
        },
      ],
      xaxis: {
        categories: chartData.dates,
        tickAmount: 6,
        labels: {
          rotate: -45,
          style: { 
            colors: "#cccccc",
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          },
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
          formatter: (val) => `₹${val.toFixed(2)}`,
          style: { 
            colors: "#cccccc",
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          },
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
      theme: { mode: "dark" },
      stroke: { 
        curve: "smooth", 
        width: 3,
        lineCap: 'round'
      },
      grid: {
        borderColor: "#333333",
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
        theme: "dark",
        style: {
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: (val) => `₹${val.toFixed(2)}`,
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
    };

    const chart = new ApexCharts(chartEl, options);
    chart.render();
  }, [chartData, fund]);

  const handleInvest = async () => {
  const email = localStorage.getItem("user_email");
  if (!email) {
    alert("Please login to start investments.");
    return;
  }

  if (!formData.amount || !formData.sip_date || !investmentType || !formData.payment_mode) {
    alert("Please fill all fields.");
    return;
  }

    setIsInvesting(true);

    try {
  const payload = {
    email,
    fund_id: id,
    name: fund.name,
    amount: parseFloat(formData.amount),
    sip_date: formData.sip_date,
    investment_type: investmentType,
    nav: fund.nav,
    category: fund.category,
    risk: fund.risk,
    payment_mode: formData.payment_mode
  };

    const res = await axios.post("http://localhost:8000/web/mutual-funds/invest/", payload);
    const { message, new_balance } = res.data || {};
    if (new_balance !== undefined) {
      alert(`${message || 'Investment saved successfully ✅'}\nUpdated Wallet Balance: ₹${Number(new_balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } else {
      alert(message || 'Investment saved successfully ✅');
    }
    setFormData({ amount: "", sip_date: "", payment_mode: "" });
      setInvestmentType("one-time");
    } catch (err) {
    console.error(err);
    const apiMsg = err?.response?.data?.error || err?.message || 'Investment failed ❌';
    alert(apiMsg);
    } finally {
      setIsInvesting(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#00ff99';
      case 'moderate': return '#ffaa00';
      case 'high': return '#ff4d4d';
      default: return '#cccccc';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading fund details...</p>
      </div>
    );
  }

  if (!fund) return <div className="text-white">Fund not found</div>;

  return (
    <div className="mutual-fund-details-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .mutual-fund-details-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 2rem 0;
        }

        .mutual-fund-details-container::before {
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

        .mutual-fund-details-container > * {
          position: relative;
          z-index: 2;
        }

        .page-header {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .fund-title {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(45deg, #00bfff, #00ff99);
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

        .fund-subtitle {
          color: #cccccc;
          font-size: 1.1rem;
          font-weight: 300;
          margin-bottom: 1.5rem;
        }

        .fund-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 1.5rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.5);
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #00bfff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #cccccc;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .chart-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
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

        .chart-title {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .time-range-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .time-btn {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
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

        .investment-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          height: fit-content;
        }

        .investment-title {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          color: #cccccc;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-control {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .form-control:focus {
          outline: none;
          color: #ffffff;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
          transform: scale(1.02);
        }

        .form-control::placeholder {
          color: #888888;
        }

        .form-select {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .form-select:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
          transform: scale(1.02);
        }

        .invest-button {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          border: none;
          border-radius: 15px;
          padding: 1rem 2rem;
          color: #000;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
        }

        .invest-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .invest-button:hover::before {
          left: 100%;
        }

        .invest-button:hover {
          background: linear-gradient(135deg, #00ff99, #00bfff);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .invest-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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
          .stat-number {
            font-size: 1.2rem;
          }
          .fund-title {
            font-size: 2rem;
          }

          .fund-subtitle {
            font-size: 1rem;
          }

          .fund-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .time-range-buttons {
            width: 100%;
            justify-content: center;
          }

          .time-btn {
            font-size: 0.8rem;
            padding: 0.4rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .stat-number {
            font-size: 0.8rem;
          }
          .fund-title {
            font-size: 1.8rem;
          }

          .fund-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-section,
          .investment-section {
            padding: 1.5rem;
          }
        }

        /* Enhanced Accessibility */
        .invest-button:focus,
        .form-control:focus,
        .form-select:focus,
        .time-btn:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
        }

        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }
      `}</style>

      <Container>
        <div className="page-header">
          <h1 className="fund-title">{fund.name}</h1>
          <p className="fund-subtitle">
            {fund.category} | ₹{fund.nav.toFixed(2)} | Risk: {fund.risk}
          </p>

          <div className="fund-stats">
            <div className="stat-card">
              <div className="stat-number">₹{fund.nav.toFixed(2)}</div>
              <div className="stat-label">Current NAV</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{fund.category}</div>
              <div className="stat-label">Category</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: getRiskColor(fund.risk) }}>
                {fund.risk}
              </div>
              <div className="stat-label">Risk Level</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹{fund.min_investment}</div>
              <div className="stat-label">Min Investment</div>
            </div>
          </div>
        </div>

        <Row>
          <Col lg={8}>
            <div className="chart-section">
              <div className="chart-header">
                <h3 className="chart-title">
                  <FaChartLine />
                  NAV Performance
                </h3>
                <div className="time-range-buttons">
            {["1M", "6M", "YTD", "1Y", "5Y", "MAX"].map((label) => (
                    <button
                key={label}
                      className={`time-btn ${label === timeRange ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange(label)}
              >
                {label}
                    </button>
            ))}
          </div>
              </div>
              <div id="mutualFundChart" />
            </div>
        </Col>

          <Col lg={4}>
            <div className="investment-section">
              <h3 className="investment-title">
                <FaMoneyBillWave />
                Invest in {fund.name}
              </h3>

              <div className="form-group">
                <label className="form-label">
                  <FaArrowUp />
                  Investment Type
                </label>
                <select
                  className="form-select"
                  value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value)}
              >
                  <option value="sip"> Monthly SIP</option>
                  <option value="one-time">One Time Investment</option>
                </select>
              </div>

            {(investmentType==='one-time') && (
              <>
                  <div className="form-group">
                    <label className="form-label">
                      <FaMoneyBillWave />
                      Amount (₹)
                    </label>
                    <input
                    type="number"
                    className="form-control"
                    placeholder="Enter investment amount"
                    min="500"
                    max="100000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaCreditCard />
                      Payment Mode
                    </label>
                    <select
                      className="form-select"
                      value={formData.payment_mode}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_mode: e.target.value, sip_date: 'Not Applicable' })
                      }
                    >
                      <option value="">Select Payment Mode</option>
                    <option value="UPI">UPI</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Debit Card">Debit Card</option>
                    </select>
                  </div>

                  <button
                    className="invest-button"
                    onClick={handleInvest}
                    disabled={isInvesting}
                  >
                    {isInvesting ? (
                      <>
                        <FaSpinner className="fa-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                  Invest Now
                      </>
                    )}
                  </button>
              </>
            )}
            {(investmentType==='sip') && (
              <>
                  <div className="form-group">
                    <label className="form-label">
                      <FaMoneyBillWave />
                      Amount (₹)
                    </label>
                    <input
                    type="number"
                    className="form-control"
                    placeholder="Enter investment amount"
                    min="500"
                    max="100000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaCalendar />
                      Date of SIP
                    </label>
                    <input
                    type="number"
                      min={1}
                      max={30}
                      className="form-control"
                      placeholder="Monthly SIP date"
                      value={formData.sip_date}
                    onChange={(e) =>
                      setFormData({ ...formData, sip_date: e.target.value })
                    }
                  />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaCreditCard />
                      Payment Mode
                    </label>
                    <select
                      className="form-select"
                      value={formData.payment_mode}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_mode: e.target.value })
                      }
                    >
                      <option value="">Select Payment Mode</option>
                    <option value="UPI">UPI</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Debit Card">Debit Card</option>
                    </select>
                  </div>

                  <button
                    className="invest-button"
                    onClick={handleInvest}
                    disabled={isInvesting}
                  >
                    {isInvesting ? (
                      <>
                        <FaSpinner className="fa-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                  Invest Now
                      </>
                    )}
                  </button>
              </>
            )}
            </div>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default MutualFundDetails;
