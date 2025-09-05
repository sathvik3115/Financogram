// FinancialTools.js (React Version)
import React, { useState, useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Table } from 'react-bootstrap';
import { FaCalculator, FaPiggyBank, FaGraduationCap, FaHome, FaRocket } from 'react-icons/fa';

const FinancialTools = () => {
  const [activeTool, setActiveTool] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
    animatedElements.forEach(el => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Ensure calculator-section fade-in is visible
  useEffect(() => {
    if (activeTool) {
      // Wait for the calculator-section to render
      setTimeout(() => {
        const fadeIn = document.querySelector('.calculator-section .fade-in');
        if (fadeIn) fadeIn.classList.add('animate-in');
      }, 0);
    }
  }, [activeTool]);

  const formatCurrency = (value) => `₹${value.toFixed(0).toLocaleString('en-IN')}`;

let chartInstances = {};

const renderChart = (id, labels, values) => {
  const chartEl = document.getElementById(id);
  if (!chartEl) return;

  // Destroy old chart if it exists
  if (chartInstances[id]) {
    chartInstances[id].destroy();
  }

  chartEl.innerHTML = '';

  const series = labels.map((label, i) => ({
    name: label,
    data: [values[i]]
  }));

  const options = {
    series,
    chart: {
      type: 'bar',
      height: 350,
        background: 'transparent',
        foreColor: '#ffffff'
    },
    grid: {
      show: true,
        borderColor: 'rgba(0, 191, 255, 0.2)',
      strokeDashArray: 4,
      position: 'back',
      xaxis: {
      lines: {
        show: true
          }
        },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
          endingShape: 'rounded',
          borderRadius: 8
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
        categories: ['Total'],
        labels: {
          style: {
            colors: '#ffffff'
          }
        }
    },
    yaxis: {
      title: {
          text: 'Amount (₹)',
          style: {
            color: '#ffffff'
          }
        },
        labels: {
          style: {
            colors: '#ffffff'
          }
      }
    },
    fill: {
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#00bfff', '#00ff99'],
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.9,
          stops: [0, 100]
        }
    },
    tooltip: {
        theme: 'dark',
      y: {
        formatter: (val) => `₹${val.toFixed(0).toLocaleString('en-IN')}`
      }
    },
      colors: ['#00bfff', '#00ff99', '#ff4d4d', '#ff6b6b'],
    theme: {
      mode: 'dark'
    }
  };

  const chart = new ApexCharts(chartEl, options);
  chart.render();
  chartInstances[id] = chart;
};

  const calculators = {
    sip: {
      label: 'SIP Calculator',
      icon: <FaPiggyBank />,
      description: 'Calculate your Systematic Investment Plan returns',
      color: '#00bfff',
      render: () => <SIPCalculator renderChart={renderChart} formatCurrency={formatCurrency} />
    },
    emi: {
      label: 'EMI Calculator',
      icon: <FaHome />,
      description: 'Calculate your Equated Monthly Installments',
      color: '#00ff99',
      render: () => <EMICalculator renderChart={renderChart} formatCurrency={formatCurrency} />
    },
    retirement: {
      label: 'Retirement Planner',
      icon: <FaRocket />,
      description: 'Plan your retirement corpus and investments',
      color: '#ff4d4d',
      render: () => <RetirementCalculator renderChart={renderChart} formatCurrency={formatCurrency} />
    },
    education: {
      label: 'Education Planner',
      icon: <FaGraduationCap />,
      description: 'Plan your child\'s education expenses',
      color: '#ff6b6b',
      render: () => <EducationPlanner renderChart={renderChart} formatCurrency={formatCurrency} />
    }
  };

  return (
    <div className="financial-tools-page">
    <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .financial-tools-page {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
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

        /* Animation Classes */
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-in {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.8s ease-out;
        }

        .slide-in.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        .scale-in {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s ease-out;
        }

        .scale-in.animate-in {
          opacity: 1;
          transform: scale(1);
        }

        /* Header Section */
        .tools-header {
          background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%);
          padding: 3rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .tools-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(0,191,255,0.1), rgba(0,255,153,0.1));
          z-index: 1;
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .page-title {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(45deg, #00bfff, #00ff99, #ff4d4d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .page-subtitle {
          font-size: 1.3rem;
          color: #cccccc;
          margin-bottom: 2rem;
          font-weight: 300;
        }

        /* Tools Grid */
        .tools-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
        }

        .tool-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.1);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          height: 100%;
          cursor: pointer;
        }

        .tool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .tool-card:hover::before {
          left: 100%;
        }

        .tool-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.3);
        }

        .tool-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .tool-card:hover .tool-icon {
          transform: scale(1.05);
        }

        .tool-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .tool-description {
          color: #cccccc;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .calculate-btn {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border: none;
          border-radius: 25px;
          padding: 0.75rem 2rem;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .calculate-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .calculate-btn:hover::before {
          left: 100%;
        }

        .calculate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 191, 255, 0.3);
        }

        /* Calculator Section */
        .calculator-section {
          padding: 3rem 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
        }

        .calculator-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          border: 1px solid rgba(0, 191, 255, 0.2);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .calculator-header {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          padding: 1.5rem;
          color: #000;
          font-weight: 600;
          font-size: 1.3rem;
        }

        .calculator-body {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-control {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 10px;
          color: #ffffff;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .form-control:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
          transform: scale(1.02);
        }

        .form-control::placeholder {
          color: #888;
        }

        .calculate-action-btn {
          background: linear-gradient(45deg, #00ff99, #00bfff);
          border: none;
          border-radius: 25px;
          padding: 1rem 2rem;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .calculate-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 255, 153, 0.3);
        }

        .results-section {
          background: rgba(0, 191, 255, 0.1);
          border-radius: 15px;
          padding: 1.5rem;
          margin-top: 1rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-label {
          color: #cccccc;
          font-weight: 500;
        }

        .result-value {
          color: #00bfff;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .chart-container {
          background: rgba(26, 26, 26, 0.5);
          border-radius: 15px;
          padding: 1rem;
          margin-top: 1rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
        }

        /* Table Styling */
        .table-dark {
          background: rgba(26, 26, 26, 0.8);
          border-radius: 15px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .table-dark th {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          font-weight: 600;
          border: none;
        }

        .table-dark td {
          border-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .table-dark tbody tr:hover {
          background: rgba(0, 191, 255, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2.5rem;
          }

          .tool-card {
            padding: 1.5rem;
          }

          .calculator-body {
            padding: 1.5rem;
          }

          .tool-icon {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 576px) {
          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1.1rem;
          }

          .tool-card {
            padding: 1rem;
          }

          .calculator-body {
            padding: 1rem;
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

        /* Pulse Animation */
        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 191, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 191, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 191, 255, 0); }
        }
    `}</style>

      {/* Header Section */}
      <section className="tools-header">
        <div className="container">
          <div className="header-content">
            <h1 className="page-title floating">
              <FaCalculator className="me-3" />
              Financial Tools
            </h1>
            <p className="page-subtitle fade-in">
              Powerful calculators and planners to help you make informed financial decisions
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="tools-section">
        <div className="container">
          <div className="row g-4">
            {Object.keys(calculators).map((key, index) => (
              <div key={key} className="col-lg-6 col-md-6">
                <a href="#calculator-section" style={{ textDecoration: 'none' }}>
                <div 
                  className="tool-card scale-in"
                  onClick={() => setActiveTool(key)}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="tool-icon"
                    style={{ color: calculators[key].color }}
                  >
                    {calculators[key].icon}
                  </div>
                  <h3 className="tool-title">{calculators[key].label}</h3>
                  <p className="tool-description">{calculators[key].description}</p>
                  <button className="calculate-btn pulse">
                    Calculate Now
                  </button>
                </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      {activeTool && (
        <section className="calculator-section" id='calculator-section'>
          <div className="container">
            <div className="fade-in">
              {calculators[activeTool].render()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const SIPCalculator = ({ renderChart, formatCurrency }) => {
  const [amount, setAmount] = useState(5000);
  const [period, setPeriod] = useState(10);
  const [returnRate, setReturnRate] = useState(12);
  const [results, setResults] = useState({});
  const [chartData, setChartData] = useState(null);

  const calculate = () => {
    const monthlyRate = returnRate / 12 / 100;
    const months = period * 12;
    const totalInvested = amount * months;
    const futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalReturns = futureValue - totalInvested;

    setResults({ totalInvested, totalReturns, futureValue });
    setChartData([totalInvested, totalReturns]);
  };

  useEffect(() => {
    if (chartData) {
      renderChart('sipChart', ['Invested', 'Returns'], chartData);
    }
  }, [chartData, renderChart]);

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <FaPiggyBank className="me-2" />
        SIP Calculator
      </div>
      <div className="calculator-body">
      <Row>
          <Col lg={6}>
            <div className="form-group">
              <label className="form-label">Monthly Investment (₹)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                placeholder="Enter monthly investment"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Investment Period (Years)</label>
              <input
                type="number"
                className="form-control"
                value={period}
                onChange={(e) => setPeriod(+e.target.value)}
                placeholder="Enter investment period"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Return (%)</label>
              <input
                type="number"
                className="form-control"
                value={returnRate}
                onChange={(e) => setReturnRate(+e.target.value)}
                placeholder="Enter expected return"
              />
            </div>
            <button className="calculate-action-btn" onClick={calculate}>
              Calculate SIP Returns
            </button>
        </Col>
          <Col lg={6}>
          {results.futureValue && (
              <div className="results-section">
                <div className="result-item">
                  <span className="result-label">Total Invested:</span>
                  <span className="result-value">{formatCurrency(results.totalInvested)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Expected Returns:</span>
                  <span className="result-value">{formatCurrency(results.totalReturns)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Future Value:</span>
                  <span className="result-value">{formatCurrency(results.futureValue)}</span>
                </div>
                <div className="chart-container">
              <div id="sipChart"></div>
                </div>
              </div>
          )}
        </Col>
      </Row>
      </div>
    </div>
  );
};

const EMICalculator = ({ renderChart, formatCurrency }) => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emiResult, setEmiResult] = useState({});
  const [amortization, setAmortization] = useState([]);
  const [chartData, setChartData] = useState(null);

  const calculate = () => {
    const rate = interestRate / 12 / 100;
    const months = loanTenure * 12;
    const emi = loanAmount * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;

    setEmiResult({ emi, totalInterest, totalPayment });
    setChartData([loanAmount, totalInterest]);

    let balance = loanAmount;
    const schedule = [];
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= months; month++) {
      const interest = balance * rate;
      const principalPaid = emi - interest;
      balance -= principalPaid;

      yearlyPrincipal += principalPaid;
      yearlyInterest += interest;

      if (month % 12 === 0 || month === months) {
        schedule.push({
          year: Math.ceil(month / 12),
          principal: yearlyPrincipal,
          interest: yearlyInterest,
          balance
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }
    setAmortization(schedule);
  };

  useEffect(() => {
    if (chartData) {
      renderChart('emiChart', ['Principal', 'Interest'], chartData);
    }
  }, [chartData, renderChart]);

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <FaHome className="me-2" />
        EMI Calculator
      </div>
      <div className="calculator-body">
      <Row>
          <Col lg={6}>
            <div className="form-group">
              <label className="form-label">Loan Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={loanAmount}
                onChange={(e) => setLoanAmount(+e.target.value)}
                placeholder="Enter loan amount"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Interest Rate (% p.a.)</label>
              <input
                type="number"
                className="form-control"
                value={interestRate}
                onChange={(e) => setInterestRate(+e.target.value)}
                placeholder="Enter interest rate"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Loan Tenure (Years)</label>
              <input
                type="number"
                className="form-control"
                value={loanTenure}
                onChange={(e) => setLoanTenure(+e.target.value)}
                placeholder="Enter loan tenure"
              />
            </div>
            <button className="calculate-action-btn" onClick={calculate}>
              Calculate EMI
            </button>
        </Col>
          <Col lg={6}>
          {emiResult.emi && (
              <div className="results-section">
                <div className="result-item">
                  <span className="result-label">Monthly EMI:</span>
                  <span className="result-value">{formatCurrency(emiResult.emi)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Total Interest:</span>
                  <span className="result-value">{formatCurrency(emiResult.totalInterest)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Total Payment:</span>
                  <span className="result-value">{formatCurrency(emiResult.totalPayment)}</span>
                </div>
                <div className="chart-container">
              <div id="emiChart"></div>
                </div>
              </div>
          )}
        </Col>
      </Row>
      {amortization.length > 0 && (
        <div className="mt-4">
            <h5 className="text-center mb-3" style={{ color: '#00bfff' }}>Amortization Schedule</h5>
            <div className="table-responsive">
              <Table className="table-dark">
            <thead>
              <tr>
                <th>Year</th>
                <th>Principal Paid</th>
                <th>Interest Paid</th>
                <th>Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {amortization.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.year}</td>
                  <td>{formatCurrency(row.principal)}</td>
                  <td>{formatCurrency(row.interest)}</td>
                  <td>{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

const RetirementCalculator = ({ renderChart, formatCurrency }) => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [returnRate, setReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [results, setResults] = useState({});
  const [chartData, setChartData] = useState(null);

  const calculate = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const realRate = (1 + returnRate / 100) / (1 + inflationRate / 100) - 1;
    const requiredCorpus = inflatedExpenses * 12 * (1 - Math.pow(1 + realRate, -30)) / realRate;
    const r = returnRate / 12 / 100;
    const monthlyInvestment = requiredCorpus * r / (Math.pow(1 + r, yearsToRetirement * 12) - 1);

    setResults({ requiredCorpus, monthlyInvestment, yearsToRetirement });
    setChartData([monthlyInvestment * 12 * yearsToRetirement, requiredCorpus]);
  };

  useEffect(() => {
    if (chartData) {
      renderChart('retirementChart', ['Invested', 'Required Corpus'], chartData);
    }
  }, [chartData, renderChart]);

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <FaRocket className="me-2" />
        Retirement Planner
      </div>
      <div className="calculator-body">
      <Row>
          <Col lg={6}>
            <div className="form-group">
              <label className="form-label">Current Age</label>
              <input
                type="number"
                className="form-control"
                value={currentAge}
                onChange={(e) => setCurrentAge(+e.target.value)}
                placeholder="Enter current age"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Retirement Age</label>
              <input
                type="number"
                className="form-control"
                value={retirementAge}
                onChange={(e) => setRetirementAge(+e.target.value)}
                placeholder="Enter retirement age"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Expenses (₹)</label>
              <input
                type="number"
                className="form-control"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(+e.target.value)}
                placeholder="Enter monthly expenses"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Return (%)</label>
              <input
                type="number"
                className="form-control"
                value={returnRate}
                onChange={(e) => setReturnRate(+e.target.value)}
                placeholder="Enter expected return"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Inflation Rate (%)</label>
              <input
                type="number"
                className="form-control"
                value={inflationRate}
                onChange={(e) => setInflationRate(+e.target.value)}
                placeholder="Enter inflation rate"
              />
            </div>
            <button className="calculate-action-btn" onClick={calculate}>
              Calculate Retirement Plan
            </button>
        </Col>
          <Col lg={6}>
          {results.requiredCorpus && (
              <div className="results-section">
                <div className="result-item">
                  <span className="result-label">Required Corpus:</span>
                  <span className="result-value">{formatCurrency(results.requiredCorpus)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Monthly Investment:</span>
                  <span className="result-value">{formatCurrency(results.monthlyInvestment)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Years to Retirement:</span>
                  <span className="result-value">{results.yearsToRetirement}</span>
                </div>
                <div className="chart-container">
              <div id="retirementChart"></div>
                </div>
              </div>
          )}
        </Col>
      </Row>
      </div>
    </div>
  );
};

const EducationPlanner = ({ renderChart, formatCurrency }) => {
  const [childAge, setChildAge] = useState(5);
  const [educationAge, setEducationAge] = useState(18);
  const [currentCost, setCurrentCost] = useState(1000000);
  const [inflationRate, setInflationRate] = useState(10);
  const [results, setResults] = useState({});
  const [chartData, setChartData] = useState(null);

  const calculate = () => {
    const years = educationAge - childAge;
    const futureCost = currentCost * Math.pow(1 + inflationRate / 100, years);
    const r = 12 / 12 / 100; // 12% annual expected return
    const monthlyInvestment = futureCost * r / (Math.pow(1 + r, years * 12) - 1);

    setResults({ futureCost, monthlyInvestment, years });
    setChartData([currentCost, futureCost - currentCost]);
  };

  useEffect(() => {
    if (chartData) {
      renderChart('educationChart', ['Current Cost', 'Inflation'], chartData);
    }
  }, [chartData, renderChart]);

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <FaGraduationCap className="me-2" />
        Education Planner
      </div>
      <div className="calculator-body">
      <Row>
          <Col lg={6}>
            <div className="form-group">
              <label className="form-label">Child's Current Age</label>
              <input
                type="number"
                className="form-control"
                value={childAge}
                onChange={(e) => setChildAge(+e.target.value)}
                placeholder="Enter child's age"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education Starts At Age</label>
              <input
                type="number"
                className="form-control"
                value={educationAge}
                onChange={(e) => setEducationAge(+e.target.value)}
                placeholder="Enter education start age"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Education Cost (₹)</label>
              <input
                type="number"
                className="form-control"
                value={currentCost}
                onChange={(e) => setCurrentCost(+e.target.value)}
                placeholder="Enter current cost"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education Inflation (%)</label>
              <input
                type="number"
                className="form-control"
                value={inflationRate}
                onChange={(e) => setInflationRate(+e.target.value)}
                placeholder="Enter inflation rate"
              />
            </div>
            <button className="calculate-action-btn" onClick={calculate}>
              Calculate Education Plan
            </button>
        </Col>
          <Col lg={6}>
          {results.futureCost && (
              <div className="results-section">
                <div className="result-item">
                  <span className="result-label">Future Education Cost:</span>
                  <span className="result-value">{formatCurrency(results.futureCost)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Monthly Investment:</span>
                  <span className="result-value">{formatCurrency(results.monthlyInvestment)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Years to Education:</span>
                  <span className="result-value">{results.years}</span>
                </div>
                <div className="chart-container">
              <div id="educationChart"></div>
                </div>
              </div>
          )}
        </Col>
      </Row>
      </div>
    </div>
  );
};

export default FinancialTools;
