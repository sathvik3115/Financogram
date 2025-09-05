import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from "react-router-dom";
import { FaBars, FaUserCircle, FaSearch, FaHome, FaChartLine, FaWallet, FaTools, FaHeadset, FaCoins, FaRobot, FaComments, FaTimes, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const observerRef = useRef(null);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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

    // Click outside handler for search results
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector('.search1-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    fetch(`${process.env.REACT_APP_BACKEND_URL}/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    setShowModal(false);
    navigate('/');
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results = performSearch(query);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchResults(results.length > 0);
    }, 300);
  };

  const performSearch = (query) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return [];
    }

    const searchableContent = [
      { id: 1, title: 'My Portfolio', content: 'Manage your investment portfolio with real-time tracking and analytics', path: '/Portfolio' },
      { id: 2, title: 'Financial Tools', content: 'Advanced financial calculators and investment planning tools', path: '/FinancialTools' },
      { id: 3, title: 'Mutual Funds', content: 'Explore and invest in various mutual fund schemes', path: '/MutualFunds' },
      { id: 4, title: 'Stock Market', content: 'Real-time stock market data and trading insights', path: '/StockMarket' },
      { id: 5, title: 'AI Prediction', content: 'AI-powered market predictions and investment recommendations', path: '/Prediction' },
      { id: 6, title: 'Financial News', content: 'Latest financial news and market updates', path: '/FinancialNews' },
      { id: 7, title: 'AI Assistant', content: '24/7 AI chatbot for financial queries and assistance', path: '/Chatbot' },
      { id: 8, title: 'My Profile', content: 'Manage your account profile and preferences', path: '/Profile' }
    ];

    const lowerQuery = query.toLowerCase();
    return searchableContent.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.content.toLowerCase().includes(lowerQuery)
    );
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    window.location.href = result.path;
  };

  const navItems = [
    { path: "/", icon: <FaHome />, label: "Dashboard" },
    { path: "/Portfolio", icon: <FaWallet />, label: "My Portfolio" },
    { path: "/FinancialTools", icon: <FaTools />, label: "Financial Tools" },
    { path: "/FinancialNews", icon: <FaComments />, label: "Financial News" },
    { path: "/MutualFunds", icon: <FaCoins />, label: "Mutual Funds" },
    { path: "/StockMarket", icon: <FaChartLine />, label: "Stock Market" },
    { path: "/Prediction", icon: <FaRobot />, label: "AI Prediction" },
    { path: "/Chatbot", icon: <FaHeadset />, label: "AI Assistance" }
  ];

  // Function to check if a nav item is active based on current location
  const isNavItemActive = (navPath) => {
    const currentPath = location.pathname;
    
    // Special case for Dashboard home
    if (navPath === "/") {
      return currentPath === "/" || currentPath === "/";
    }
    
    // For other routes, check if current path starts with nav path
    return currentPath.startsWith(navPath);
  };

  return (
    <div className="finance-dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .finance-dashboard {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 5px;
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

        /* Top Navbar */
        .top-navbar {
          background: linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1100;
          padding: 0.75rem 0;
          transition: all 0.3s ease;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
        }

        .logo-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #00bfff;
          transition: all 0.3s ease;
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from { box-shadow: 0 0 10px rgba(0, 191, 255, 0.5); }
          to { box-shadow: 0 0 20px rgba(0, 255, 153, 0.5); }
        }

        .logo-img:hover {
          transform: scale(1.1);
          border-color: #00ff99;
        }

        .brand-name {
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }

        .brand-name:hover {
          filter: drop-shadow(0 0 10px rgba(0, 191, 255, 0.5));
          transform: scale(1.05);
        }

        /* Search Bar */
        .search1-container {
          position: relative;
          margin-left: 2rem;
          margin-right: 2rem;
          width: 400px;
          transition: all 0.3s ease;
        }

        .search1-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 25px;
          background: rgba(26, 26, 26, 0.8);
          color: #ffffff;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .search1-input:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
          transform: scale(1.02);
        }

        .search1-input::placeholder {
          color: #888;
        }

        .search1-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .search1-btn:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
        }

        .search-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Search Results Dropdown */
        .search-results-dropdown {
          scrollbar-width: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
          margin-top: 0.5rem;
        }

        .search-loading {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cccccc;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid #00bfff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .search-result-item {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-result-item:hover {
          background: rgba(0, 191, 255, 0.1);
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .result-icon {
          color: #00bfff;
          flex-shrink: 0;
        }

        .result-content {
          flex: 1;
        }

        .result-title {
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .result-description {
          font-size: 0.9rem;
          color: #cccccc;
          line-height: 1.4;
        }

        .no-results {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-style: italic;
        }

        /* Logout Modal Styles */
        .logout-warning {
          text-align: center;
        }

        .warning-icon {
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .logout-details {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #00bfff;
          font-size: 0.9rem;
        }

        .search1-btn:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);
        }

        /* Navbar Controls */
        .navbar-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-btn {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          border-color: #00bfff;
          background: rgba(0, 191, 255, 0.1);
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
        }

        /* Account Dropdown */
        .account-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 15px;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          min-width: 200px;
          overflow: hidden;
          z-index: 1200;
          backdrop-filter: blur(20px);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-item:hover {
          background: rgba(0, 191, 255, 0.1);
          color: #00bfff;
          text-decoration: none;
          transform: translateX(5px);
        }

        .dropdown-item.danger {
          color: #ff4d4d;
        }

        .dropdown-item.danger:hover {
          background: rgba(255, 77, 77, 0.1);
          color: #ff6b6b;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 280px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border-right: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 5px 0 20px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-100%);
          backdrop-filter: blur(20px);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 0.5rem 1.5rem;
          border-bottom: 1px solid rgba(0, 191, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .close-sidebar {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-sidebar:hover {
          color: #ff4d4d;
          transform: scale(1.1);
        }

        .sidebar-nav {
          padding: 1rem 0;
          overflow-y: auto;
          height: calc(100vh - 120px);
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-radius: 3px;
        }

        .nav-item {
          margin: 0.5rem 1rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .nav-link:hover::before {
          left: 100%;
        }

        .nav-link:hover {
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          color: #00bfff;
          transform: translateX(10px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.2);
        }

        .nav-link.active {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
        }

        .nav-icon {
          font-size: 1.2rem;
          min-width: 24px;
        }

        /* Overlay */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 999;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Main Content */
        .main-content {
          margin-left: 0;
          padding-top: 80px;
          min-height: calc(100vh - 80px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-content.sidebar-open {
          margin-left: 280px;
        }

        /* Footer */
        .footer {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border-top: 1px solid rgba(0, 191, 255, 0.2);
          padding: 3rem 0 1rem;
          margin-top: auto;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section {
          text-align: center;
        }

        .footer-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-text {
          color: #cccccc;
          line-height: 1.6;
        }

        .contact-list {
          list-style: none;
          padding: 0;
        }

        .contact-list li {
          margin-bottom: 0.5rem;
          color: #cccccc;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          text-decoration: none;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
          color: #000;
          text-decoration: none;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #888;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            max-width: 320px;
          }

          .main-content.sidebar-open {
            margin-left: 0;
          }

          .brand-name,.small,.result-description {
            display: none;
          }

          .navbar-controls {
            gap: 0.5rem;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
          }

          .brand-name {
            font-size: 1.5rem;
          }

          .search-result-item {
            padding: 0.5rem 0.5rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .brand-name {
            font-size: 1.2rem;
          }

          .logo-img {
            width: 35px;
            height: 35px;
          }

          .nav-btn {
            width: 35px;
            height: 35px;
          }

          .account-dropdown {
            min-width: 180px;
          }
        }

        /* Floating Animation */
        .floating {
          animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button className="nav-btn" onClick={toggleSidebar}>
              <FaBars size={18} />
            </button>
            <a href="/" style={{ textDecoration: "none" }}>
              <div className="logo-container ms-3">
                <img src="https://res.cloudinary.com/djjww9is7/image/upload/v1756832108/favicon_hrmlmy.png" alt="Logo" className="logo-img" />
                <span className="brand-name floating">FINANCOGRAM</span>
              </div>
            </a>
          </div>

          <div className="search1-container d-md-block">
            <input
              type="text"
              className="search1-input"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
            />
            <button className="search1-btn">
              {isSearching ? (
                <div className="search-spinner"></div>
              ) : (
                <FaSearch size={14} />
              )}
            </button>

            {/* Search Results Dropdown */}
            {showSearchResults &&
              (searchResults.length > 0 || searchQuery.trim()) && (
                <div className="search-results-dropdown">
                  {isSearching ? (
                    <div className="search-loading">
                      <div className="spinner"></div>
                      <span>Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result, index) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <div className="result-icon">
                            <FaSearch size={12} />
                          </div>
                          <div className="result-content">
                            <div className="result-title">{result.title}</div>
                            <div className="result-description">
                              {result.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : searchQuery.trim() && !isSearching ? (
                    <div className="no-results">
                      <FaSearch size={14} />
                      <span>No results found for "{searchQuery}"</span>
                    </div>
                  ) : null}
                </div>
              )}
          </div>

          <div className="navbar-controls">
            {localStorage.getItem("user_email") ? (
              // User is logged in - show Logout button
              <button
                className="nav-btn-new"
                style={{
                  color: "#ff4d4d",
                  backgroundColor: "transparent",
                  padding: "4px 6px",
                  fontSize: "18px",
                  borderRadius: "5px",
                  border: "1px solid #ff4d4d",
                  cursor: "pointer"
                }}
                onClick={() => setShowModal(true)}
                data-toggle="tooltip"
                title="Logout"
              >
                <FaSignOutAlt size={18} /> <span className='small'>Logout</span>
              </button>
            ) : (
              // User is not logged in - show Login & Register button
              <>
              <a href="/Login">
                <button
                  className="nav-btn-new"
                  style={{
                    color: "#00ff99",
                    backgroundColor: "transparent",
                    padding: "4px 6px",
                    fontSize: "18px",
                    borderRadius: "5px",
                    border: "1px solid #00ff99",
                    cursor: "pointer"
                  }}
                  data-toggle="tooltip"
                  title="Login"
                >
                  <FaSignInAlt size={18} /> <span className='small'>Login</span>
                </button>
              </a>
              <a href="/Register">
                <button
                  className="nav-btn-new"
                  style={{
                    color: "#00ff99",
                    backgroundColor: "transparent",
                    padding: "4px 6px",
                    fontSize: "18px",
                    borderRadius: "5px",
                    border: "1px solid #00ff99",
                    cursor: "pointer"
                  }}
                  data-toggle="tooltip"
                  title="Register"
                >
                  <FaUserPlus size={18} /> <span className='small'>Register</span>
                </button>
              </a>
              </>
              
            )}

            {localStorage.getItem("user_email") && (
              <a href="/Profile">
                <button
                  className="nav-btn-new"
                  style={{
                    color: "#00bfff",
                    backgroundColor: "transparent",
                    padding: "4px 6px",
                    fontSize: "18px",
                    borderRadius: "5px",
                    border: "1px solid #00bfff",
                    cursor: "pointer"
                  }}
                  data-toggle="tooltip"
                  title="Profile"
                >
                  <FaUserCircle size={18} /> <span className='small'>Profile</span>
                </button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        style={{ paddingTop: "80px" }}
      >
        <div className="sidebar-header">
          <h3 className="sidebar-title">Navigation</h3>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <div key={index} className="nav-item">
              <a
                href={item.path}
                className={`nav-link ${
                  isNavItemActive(item.path) ? "active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {children}
      </div>

      {/* Logout Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          style={{ background: "#1a1a1a", color: "#ffffff"}}
        >
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#1a1a1a", color: "#ffffff" }}>
          Are you sure you want to logout from your account?
        </Modal.Body>
        <Modal.Footer style={{ background: "#1a1a1a" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            style={{
              background: "linear-gradient(45deg, #ff4d4d, #ff6b6b)",
              border: "none"
            }}
          >
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title floating">FINANCOGRAM</h3>
              <p className="footer-text">AI-Powered Financial Platform </p>
              <p className="footer-text">
                For Smart Investing and Wealth Management
              </p>
            </div>

            <div className="footer-section">
              <h6 className="footer-title">Contact Us</h6>
              <ul className="contact-list">
                <li>📧 financogram@gmail.com</li>
                <li>📞 Phone No. +91 6359630820</li>
                <li>📍 Savvy Strata, Ahmedabad</li>
              </ul>
            </div>

            <div className="footer-section">
              <h6 className="footer-title">Stay Connected</h6>
              <div className="social-links">
                <a
                  href="https://wa.me/916359630820?text=From%20your%20FINANCOGRAM%20website."
                  className="social-link"
                >
                  <i className="bi bi-whatsapp"></i>
                </a>
                <a
                  href="https://github.com/sathvik3115"
                  className="social-link"
                >
                  <i className="bi bi-github"></i>
                </a>
                <a
                  href="https://www.linkedin.com/in/sathvik-vemula-027022359/"
                  className="social-link"
                >
                  <i className="bi bi-linkedin"></i>
                </a>
                <a
                  href="https://www.instagram.com/sathvik_3115/"
                  className="social-link"
                >
                  <i className="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; FINANCOGRAM {new Date().getFullYear()}. All rights
              reserved. Made by Sathvik Vemula
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
