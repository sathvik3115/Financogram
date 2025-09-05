import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ApexCharts from "apexcharts";
import { Container, Row, Col, Table, Badge, Button, Form } from "react-bootstrap";
import { 
  FaChartLine, FaWallet, FaArrowUp, FaArrowDown, FaDollarSign, 
  FaPercentage, FaDownload, FaRedo, FaEye, FaEyeSlash, FaChartBar,
  FaChartPie , FaHistory, FaSort, FaSortUp, FaSortDown
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Portfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [chartInstances, setChartInstances] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('1y');

  const pieChartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const allocationChartRef = useRef(null);
  const returnsChartRef = useRef(null);

  const timeframes = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' }
  ];

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('user_email');
      if (!email) {
        console.error("Email not found in localStorage.");
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/web/investments/?email=${email}`);
      const dataWithNAV = await Promise.all(
        res.data.map(async (inv) => {
          try {
            const navRes = await axios.get(`https://api.mfapi.in/mf/${inv.fund_id}`);
            const latestNAV = navRes.data.data?.[0]?.nav || inv.nav;
            const previousNAV = navRes.data.data?.[1]?.nav || inv.nav;
            
            const currentValue = parseFloat(latestNAV) * (inv.amount / inv.nav);
            const previousValue = parseFloat(previousNAV) * (inv.amount / inv.nav);
            const absoluteReturn = currentValue - inv.amount;
            const percentageReturn = ((currentValue - inv.amount) / inv.amount) * 100;
            const dailyChange = currentValue - previousValue;
            const dailyChangePercent = ((currentValue - previousValue) / previousValue) * 100;

            return {
              ...inv,
              realTimeNAV: parseFloat(latestNAV),
              currentValue: currentValue.toFixed(2),
              units: (inv.amount / inv.nav).toFixed(3),
              absoluteReturn: absoluteReturn.toFixed(2),
              percentageReturn: percentageReturn.toFixed(2),
              dailyChange: dailyChange.toFixed(2),
              dailyChangePercent: dailyChangePercent.toFixed(2),
              riskLevel: getRiskLevel(inv.category),
              color: getCategoryColor(inv.category)
            };
          } catch (err) {
            return { 
              ...inv, 
              realTimeNAV: inv.nav, 
              currentValue: inv.amount, 
              units: (inv.amount / inv.nav).toFixed(3),
              absoluteReturn: '0.00',
              percentageReturn: '0.00',
              dailyChange: '0.00',
              dailyChangePercent: '0.00',
              riskLevel: getRiskLevel(inv.category),
              color: getCategoryColor(inv.category)
            };
          }
        })
      );
      setInvestments(dataWithNAV);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (category) => {
    const riskMap = {
      'Equity': 'High',
      'Debt': 'Low',
      'Hybrid': 'Moderate',
      'Liquid': 'Very Low',
      'Index': 'Moderate',
      'Sectoral': 'Very High'
    };
    return riskMap[category] || 'Moderate';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Equity': '#00ff99',
      'Debt': '#00bfff',
      'Hybrid': '#ff6b6b',
      'Liquid': '#4ecdc4',
      'Index': '#45b7d1',
      'Sectoral': '#96ceb4',
      'Large Cap': '#ff9f43',
      'Mid Cap': '#54a0ff',
      'Small Cap': '#5f27cd',
      'Multi Cap': '#00d2d3',
      'Value': '#ff6348',
      'Growth': '#2ed573',
      'Dividend Yield': '#ffa502',
      'Contra': '#3742fa',
      'Focused': '#ff6b6b',
      'ELSS': '#2f3542',
      'International': '#5352ed',
      'Arbitrage': '#ff9ff3',
      'Dynamic Bond': '#feca57',
      'Corporate Bond': '#48dbfb',
      'Banking': '#ff9ff3',
      'Technology': '#54a0ff',
      'Healthcare': '#00d2d3',
      'Energy': '#ff6348',
      'Real Estate': '#ffa502',
      'Infrastructure': '#2ed573',
      'Pharma': '#3742fa',
      'Auto': '#ff6b6b',
      'FMCG': '#2f3542',
      'Consumer': '#5352ed',
      'Financial Services': '#feca57',
      'Manufacturing': '#48dbfb'
    };
    return colorMap[category] || '#cccccc';
  };

  const getRiskColor = (risk) => {
    const colorMap = {
      'Very Low': 'success',
      'Low': 'info',
      'Moderate': 'warning',
      'High': 'danger',
      'Very High': 'dark'
    };
    return colorMap[risk] || 'secondary';
  };

  const generateDynamicColors = (count) => {
    const baseColors = [
      '#00ff99', '#ff6b6b', '#00bfff', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#ff9f43', '#54a0ff', '#5f27cd', '#00d2d3', '#ff6348', '#2ed573',
      '#ffa502', '#3742fa', '#2f3542', '#5352ed', '#ff9ff3', '#feca57',
      '#48dbfb', '#ff4757', '#2f3542', '#5352ed', '#ff9ff3', '#feca57'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    if (investments.length > 0) {
      renderCharts();
    }
  }, [investments, selectedTimeframe]);

  const renderCharts = () => {
    renderPieChart();
    renderPerformanceChart();
    renderAllocationChart();
    renderReturnsChart();
  };

  const renderPieChart = () => {
    if (!pieChartRef.current) return;

    // Destroy existing chart
    if (chartInstances.pie) {
      chartInstances.pie.destroy();
    }

    const categories = {};
    investments.forEach(inv => {
      const category = inv.category;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += parseFloat(inv.currentValue);
    });

    const categoryColors = Object.keys(categories).map(cat => getCategoryColor(cat));
    // Fallback to dynamic colors if any category doesn't have a specific color
    const finalColors = categoryColors.some(color => color === '#cccccc') 
      ? generateDynamicColors(Object.keys(categories).length)
      : categoryColors;

    const options = {
      series: Object.values(categories),
      chart: {
        type: 'donut',
        height: 350,
        background: 'transparent',
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
      labels: Object.keys(categories),
      colors: finalColors,
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#cccccc',
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '20px',
                fontFamily: 'Inter, sans-serif',
                color: '#ffffff',
                formatter: function (val) {
                  return '₹' + parseFloat(val).toLocaleString('en-IN');
                }
              },
              total: {
                show: true,
                label: 'Total Portfolio',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#00bfff',
                formatter: function (w) {
                  return '₹' + w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString('en-IN');
                }
              }
            }
          }
        }
      },
      stroke: {
        width: 0
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          return opts.w.globals.seriesTotals[opts.seriesIndex].toFixed(1) + '%';
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: ['#ffffff']
        }
      },
              legend: {
          position: 'bottom',
          labels: {
            colors: finalColors
          }
        },
      theme: {
        mode: 'dark'
      }
    };

    const chart = new ApexCharts(pieChartRef.current, options);
    chart.render();
    setChartInstances(prev => ({ ...prev, pie: chart }));
  };

  const renderPerformanceChart = () => {
    if (!performanceChartRef.current) return;

    if (chartInstances.performance) {
      chartInstances.performance.destroy();
    }

    const categories = [...new Set(investments.map(inv => inv.category))];
    const performanceData = categories.map(category => {
      const categoryInvestments = investments.filter(inv => inv.category === category);
      const avgReturn = categoryInvestments.reduce((sum, inv) => sum + parseFloat(inv.percentageReturn), 0) / categoryInvestments.length;
      return avgReturn;
    });

    const categoryColors = categories.map(cat => getCategoryColor(cat));
    // Fallback to dynamic colors if any category doesn't have a specific color
    const finalColors = categoryColors.some(color => color === '#cccccc') 
      ? generateDynamicColors(categories.length)
      : categoryColors;

    const options = {
      series: [{
        name: 'Returns (%)',
        data: performanceData
      }],
      chart: {
        type: 'bar',
        height: 350,
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8,
          distributed: true
        }
      },
      colors: finalColors,
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + '%';
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: ['#ffffff']
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: categories,
        labels: {
          show: false,
          // style: {
          //   colors: finalColors,
          //   fontSize: '12px',
          //   fontFamily: 'Inter, sans-serif'
          // }
        }
      },
      yaxis: {
        title: {
          text: 'Returns (%)',
          style: {
            color: '#cccccc',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif'
          }
        },
        labels: {
          style: {
            colors: '#cccccc',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      fill: {
        opacity: 0.8
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val) {
            return val.toFixed(2) + '%';
          }
        }
      },
      grid: {
        borderColor: '#333333',
        strokeDashArray: 5
      },
      theme: {
        mode: 'dark'
      }
    };

    const chart = new ApexCharts(performanceChartRef.current, options);
    chart.render();
    setChartInstances(prev => ({ ...prev, performance: chart }));
  };

  const renderAllocationChart = () => {
    if (!allocationChartRef.current) return;

    if (chartInstances.allocation) {
      chartInstances.allocation.destroy();
    }

    const fundNames = investments.map(inv => inv.name.substring(0, 20) + '...');
    const allocationValues = investments.map(inv => parseFloat(inv.currentValue));
    const fundColors = investments.map(inv => inv.color);
    // Fallback to dynamic colors if any fund doesn't have a specific color
    const finalColors = fundColors.some(color => color === '#cccccc') 
      ? generateDynamicColors(investments.length)
      : fundColors;

    const options = {
      series: [{
        name: 'Allocation',
        data: allocationValues
      }],
      chart: {
        type: 'bar',
        height: 400,
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '80%',
          borderRadius: 6,
          distributed: true
        }
      },
      colors: finalColors,
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return '₹' + parseFloat(val).toLocaleString('en-IN');
        },
        style: {
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
          colors: ['#ffffff']
        }
      },
      xaxis: {
        categories: fundNames,
        labels: {
          style: {
            colors: finalColors,
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: finalColors,
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        theme: 'dark',
        x: {
          formatter: function (val) {
            return '₹' + parseFloat(val).toLocaleString('en-IN');
          }
        }
      },
      grid: {
        borderColor: '#333333',
        strokeDashArray: 5
      },
      theme: {
        mode: 'dark'
      }
    };

    const chart = new ApexCharts(allocationChartRef.current, options);
    chart.render();
    setChartInstances(prev => ({ ...prev, allocation: chart }));
  };

  const renderReturnsChart = () => {
    if (!returnsChartRef.current) return;

    if (chartInstances.returns) {
      chartInstances.returns.destroy();
    }

    const dates = timeframes.map(tf => tf.label);
    const returnsData = timeframes.map(tf => {
      // Simulate returns data based on timeframe
      const baseReturn = 8.5;
      const variation = (Math.random() - 0.5) * 10;
      return baseReturn + variation;
    });

    const options = {
      series: [{
        name: 'Portfolio Returns',
        data: returnsData
      }],
      chart: {
        type: 'line',
        height: 400,
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      stroke: {
        curve: 'smooth',
        width: 4,
        colors: ['#00bfff']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#00ff99'],
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.2,
          stops: [0, 100]
        }
      },
      markers: {
        size: 6,
        colors: ['#00bfff'],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: {
          size: 8
        }
      },
      xaxis: {
        categories: dates,
        labels: {
          style: {
            colors: ['#00bfff', '#00ff99', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Returns (%)',
          style: {
            color: '#cccccc',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif'
          }
        },
        labels: {
          style: {
            colors: '#cccccc',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          },
          formatter: function (val) {
            return val.toFixed(1) + '%';
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + '%';
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: ['#000000'],
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val) {
            return val.toFixed(2) + '%';
          }
        }
      },
      grid: {
        borderColor: '#333333',
        strokeDashArray: 5
      },
      theme: {
        mode: 'dark'
      }
    };

    const chart = new ApexCharts(returnsChartRef.current, options);
    chart.render();
    setChartInstances(prev => ({ ...prev, returns: chart }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-light" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-primary" /> : <FaSortDown className="text-primary" />;
  };

  const sortedAndFilteredInvestments = investments
    .filter(inv => filterCategory === 'all' || inv.category === filterCategory)
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'currentValue':
          aVal = parseFloat(a.currentValue);
          bVal = parseFloat(b.currentValue);
          break;
        case 'percentageReturn':
          aVal = parseFloat(a.percentageReturn);
          bVal = parseFloat(b.percentageReturn);
          break;
        case 'category':
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        default:
          aVal = a[sortBy];
          bVal = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue || 0), 0);
  const totalReturn = totalCurrent - totalInvestment;
  const totalReturnPercent = ((totalReturn / totalInvestment) * 100);
  const categories = [...new Set(investments.map(inv => inv.category))];

  if (loading) {
    return (
      <div className="portfolio-loading">
        <style>{`
          .portfolio-loading {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(0, 191, 255, 0.3);
            border-top: 4px solid #00bfff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="text-center">
          <div className="loading-spinner mb-3"></div>
          <h4>Loading Portfolio...</h4>
          <p className="text-light">Fetching your investment data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .portfolio-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .portfolio-container::before {
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

        .portfolio-container > * {
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
        .portfolio-header {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(0, 191, 255, 0.2);
          padding: 2rem 0;
          margin-bottom: 2rem;
        }

        .header-content {
          text-align: center;
          max-width: 1200px;
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

        /* Summary Cards */
        .summary-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .summary-card:hover::before {
          left: 100%;
        }

        .summary-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.4);
        }

        .summary-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .summary-label {
          color: #cccccc;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Chart Cards */
        .chart-card {
          height: 100%;
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.15);
        }

        .chart-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #00bfff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Investment Cards */
        .investment-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .investment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--card-color, #ffffff));
        }

        .investment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.4);
        }

        .fund-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .fund-category {
          font-size: 0.9rem;
          color: #cccccc;
          margin-bottom: 1rem;
        }

        .fund-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .fund-return {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .fund-return.positive {
          color: #00ff99;
        }

        .fund-return.negative {
          color: #ff4d4d;
        }

        .fund-return.neutral {
          color: #cccccc;
        }

        /* Controls */
        .controls-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .control-btn {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border: none;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
          color: #000;
          text-decoration: none;
        }

        .control-btn.secondary {
          background: linear-gradient(45deg, #666666, #888888);
        }

        .form-select, .form-control {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 10px;
          color: #ffffff;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }

        .form-select:focus, .form-control:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
        }

        /* Table Styling */
        .portfolio-table {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 15px;
          overflow: hidden;
        }

        .table {
          margin-bottom: 0;
        }

        .table th {
          background: #0d1b2a;
          border: none;
          color: #00bfff;
          font-weight: 600;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .table th:hover {
          background: #09121cff
        }

        .table td {
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          vertical-align: middle;
        }

        .table tbody td {
          background: #1b263b;
          color: lightsteelblue;
        }

        .table tbody td:hover {
          background: #161e2eff;
        }

        .table tbody tr {
          transition: all 0.3s ease;
        }

        .table tbody tr:hover {
          background: rgba(0, 191, 255, 0.05);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .summary-value {
            font-size: 1.5rem;
          }

          .chart-card, .investment-card {
            padding: 1rem;
          }

          .controls-section {
            padding: 1rem;
          }
        }

        @media (max-width: 576px) {
          .page-title {
            font-size: 1.5rem;
          }

          .summary-card {
            padding: 1rem;
          }

          .fund-value {
            font-size: 1.2rem;
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

        /* Progress Bar */
        .progress {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          height: 8px;
        }

        .progress-bar {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-radius: 10px;
        }
      `}</style>

      {/* Header Section */}
      <div className="portfolio-header">
        <div className="header-content">
          <h1 className="page-title floating">
            <FaWallet className="me-3" />
            My Portfolio
          </h1>
          <p className="text-light">Track your mutual fund investments and performance</p>
        </div>
      </div>

      <Container fluid>
        {/* Summary Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <div className="summary-card">
              <div className="summary-icon">
                <FaDollarSign />
              </div>
              <div className="summary-value">
                ₹{totalInvestment.toLocaleString('en-IN')}
              </div>
              <div className="summary-label">Total Invested</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="summary-card">
              <div className="summary-icon">
                <FaChartLine />
              </div>
              <div className="summary-value">
                ₹{totalCurrent.toLocaleString('en-IN')}
              </div>
              <div className="summary-label">Current Value</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="summary-card">
              <div className="summary-icon">
                {totalReturn >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              </div>
              <div className={`summary-value ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{totalReturn.toLocaleString('en-IN')}
              </div>
              <div className="summary-label">Total Returns</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="summary-card">
              <div className="summary-icon">
                <FaPercentage />
              </div>
              <div className={`summary-value ${totalReturnPercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalReturnPercent.toFixed(2)}%
              </div>
              <div className="summary-label">Return %</div>
            </div>
          </Col>
        </Row>

        {/* Controls Section */}
        <div className="controls-section">
          <Row className="align-items-center">
            <Col md={3} className="mb-2">
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} className="mb-2">
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  className="control-btn"
                  onClick={() => setShowValues(!showValues)}
                >
                  {showValues ? <FaEyeSlash /> : <FaEye />}
                  {showValues ? 'Hide Values' : 'Show Values'}
                </Button>
                <Button
                  className="control-btn"
                  onClick={fetchInvestments}
                >
                  <FaRedo />
                  Refresh
                </Button>
                <Button
                  className="control-btn secondary"
                >
                  <FaDownload />
                  Export
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Charts Section */}
        <Row className="mb-4">
          <Col lg={6} className="mb-3">
            <div className="chart-card">
              <div className="chart-title">
                <FaChartPie  />
                Portfolio Allocation
              </div>
              <div ref={pieChartRef}></div>
            </div>
          </Col>
          <Col lg={6} className="mb-3">
            <div className="chart-card">
              <div className="chart-title">
                <FaChartBar />
                Category Performance
              </div>
              <div ref={performanceChartRef}></div>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={6} className="mb-3">
            <div className="chart-card">
              <div className="chart-title">
                <FaChartLine />
                Fund Allocation
              </div>
              <div ref={allocationChartRef}></div>
            </div>
          </Col>
          <Col lg={6} className="mb-3">
            <div className="chart-card">
              <div className="chart-title">
                <FaArrowUp />
                Returns Over Time
              </div>
              <div ref={returnsChartRef}></div>
            </div>
          </Col>
        </Row>

        {/* Investment Cards */}
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3">
              <FaWallet className="me-2" />
              Your Investments
            </h3>
          </Col>
        </Row>

        <Row xs={1} md={2} lg={3} className="g-4 mb-4">
          {sortedAndFilteredInvestments.map((inv, idx) => (
            <Col key={idx}>
              <div 
                className="investment-card"
                style={{ '--card-color': generateDynamicColors(investments.length)[idx] }}
              >
                <div className="fund-name">{inv.name}</div>
                <div className="fund-category">
                  <Badge bg="secondary" className="me-2">{inv.category}</Badge>
                  <Badge bg={getRiskColor(inv.riskLevel)} className = 'text-dark'>{inv.riskLevel} Risk</Badge>
                </div>
                
                <div className="fund-value">
                  ₹{showValues ? parseFloat(inv.currentValue).toLocaleString('en-IN') : '****'}
                </div>
                
                <div className={`fund-return ${parseFloat(inv.percentageReturn) >= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(inv.percentageReturn) >= 0 ? '+' : ''}{inv.percentageReturn}%
                  <span className="ms-2">
                    {parseFloat(inv.percentageReturn) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-light">Units</small>
                    <small className="text-light">{showValues ? (inv.units).toLocaleString('en-IN') : '****'}</small>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-light">NAV</small>
                    <small className="text-light">₹{showValues ? (inv.realTimeNAV).toLocaleString('en-IN') : '****'}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <small className="text-light">Daily Change</small>
                    <small className={parseFloat(inv.dailyChangePercent) >= 0 ? 'text-success' : 'text-danger'}>
                      {parseFloat(inv.dailyChangePercent) >= 0 ? '+' : ''}{inv.dailyChangePercent}%
                    </small>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Transaction History Table */}
        <div className="portfolio-table mb-5">
          <div className="p-3 border-bottom border-secondary">
            <h4 className="mb-0">
              <FaHistory className="me-2" />
              Transaction History
            </h4>
          </div>
          <Table responsive className="mb-0">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Fund Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                  Category {getSortIcon('category')}
                </th>
                <th onClick={() => handleSort('currentValue')} style={{ cursor: 'pointer' }}>
                  Current Value {getSortIcon('currentValue')}
                </th>
                <th onClick={() => handleSort('percentageReturn')} style={{ cursor: 'pointer' }}>
                  Returns % {getSortIcon('percentageReturn')}
                </th>
                <th>Risk Level</th>
                <th>Units</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredInvestments.map((inv, i) => (
                <tr key={i}>
                  <td>
                    <div>
                      <div className="fw-bold">{inv.name}</div>
                      <small className="text-light opacity-50">Fund ID: {inv.fund_id}</small>
                    </div>
                  </td>
                  <td>
                    {inv.category}
                  </td>
                  <td>
                    <div className="fw-bold">₹{parseFloat(inv.currentValue).toLocaleString('en-IN')}</div>
                    <small className="text-light opacity-50">Invested: ₹{parseFloat(inv.amount).toLocaleString('en-IN')}</small>
                  </td>
                  <td>
                    <div className={`fw-bold ${parseFloat(inv.percentageReturn) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {parseFloat(inv.percentageReturn) >= 0 ? '+' : ''}{inv.percentageReturn}%
                    </div>
                    <small className="text-light opacity-50">₹{inv.absoluteReturn}</small>
                  </td>
                  <td>
                    <Badge bg={getRiskColor(inv.riskLevel)} className='text-dark'>{inv.riskLevel}</Badge>
                  </td>
                  <td>{inv.units}</td>
                  <td>
                    <div>{new Date().toLocaleDateString()}</div>
                    <small className="text-light opacity-50">{new Date().toLocaleTimeString()}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

export default Portfolio;
