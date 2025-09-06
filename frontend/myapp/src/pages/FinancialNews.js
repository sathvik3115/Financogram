import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function FinancialNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const articlesPerPage = 12;
  const observerRef = useRef(null);

  // const API_KEY = process.env.REACT_APP_NEWS_API_KEY;
  // const API_URL = `https://newsapi.org/v2/everything?q=sensex&language=en&sortBy=publishedAt&pageSize=100&apiKey=${API_KEY}`;

  const categories = [
    { id: 'all', name: 'All News', icon: 'fas fa-newspaper' },
    { id: 'markets', name: 'Markets', icon: 'fas fa-chart-line' },
    { id: 'stocks', name: 'Stocks', icon: 'fas fa-chart-bar' },
    { id: 'economy', name: 'Economy', icon: 'fas fa-globe' },
    { id: 'tech', name: 'Tech Finance', icon: 'fas fa-microchip' }
  ];

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
    animatedElements.forEach(el => observerRef.current.observe(el));

    // Fallback: ensure all elements become visible after a delay
    const fallbackTimer = setTimeout(() => {
      const allAnimatedElements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
      allAnimatedElements.forEach(el => {
        if (!el.classList.contains('animate-in')) {
          el.classList.add('animate-in');
        }
      });
    }, 2000);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const filtered = news.filter(article => {
      const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      
      // Simple category filtering based on keywords
      const categoryKeywords = {
        markets: ['market', 'trading', 'sensex', 'nifty'],
        stocks: ['stock', 'shares', 'equity', 'ipo'],
        economy: ['economy', 'gdp', 'inflation', 'interest'],
        tech: ['tech', 'technology', 'startup', 'fintech']
      };
      
      const keywords = categoryKeywords[selectedCategory] || [];
      const matchesCategory = keywords.some(keyword => 
        article.title?.toLowerCase().includes(keyword) ||
        article.description?.toLowerCase().includes(keyword)
      );
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredNews(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / articlesPerPage));

    // Re-observe new elements after filtering
    setTimeout(() => {
      if (observerRef.current) {
        const newAnimatedElements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
        newAnimatedElements.forEach(el => {
          if (!el.classList.contains('animate-in')) {
            observerRef.current.observe(el);
          }
        });
      }
    }, 100);
  }, [searchTerm, news, selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/web/news/`);
      const data = await res.json();
      if (data.status === "ok") {
        setNews(data.articles);
        setFilteredNews(data.articles);
        setTotalPages(Math.ceil(data.articles.length / articlesPerPage));
      } else {
        throw new Error(data.message || "API Error");
      }
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getCurrentArticles = () => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    return filteredNews.slice(startIndex, startIndex + articlesPerPage);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button 
          className="pagination-btn" 
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {pages}
        <button 
          className="pagination-btn" 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className="finance-news-page">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Fetching latest financial news...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="finance-news-page"> 
      <div className="error-container">
        <i className="fas fa-exclamation-triangle error-icon"></i>
        <p className="error-text">{error}</p>
        <button className="retry-btn" onClick={fetchNews}>
          <i className="fas fa-redo"></i> Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="finance-news-page">
  <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .finance-news-page {
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

        /* Ensure elements become visible after a delay if observer fails */
        .fade-in {
          animation: fadeInFallback 1s ease-out 0.5s forwards;
        }

        @keyframes fadeInFallback {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.8s ease-out;
          animation: slideInFallback 1s ease-out 0.7s forwards;
        }

        .slide-in.animate-in {
          opacity: 1;
          transform: translateX(0);
        }

        @keyframes slideInFallback {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .scale-in {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s ease-out;
          animation: scaleInFallback 1s ease-out 0.9s forwards;
        }

        .scale-in.animate-in {
          opacity: 1;
          transform: scale(1);
        }

        @keyframes scaleInFallback {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Header Section */
        .news-header {
          background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
          padding: 2rem 0;
          position: relative;
          overflow: hidden;
        }

        .news-header::before {
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
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          text-align: center;
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .page-subtitle {
          text-align: center;
          color: #cccccc;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        /* Search and Filter Section */
        .controls-section {
          padding: 2rem 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
        }

        .search-container {
          max-width: 600px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1.5rem;
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 50px;
          background: rgba(26, 26, 26, 0.8);
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .search-input:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          transform: scale(1.02);
        }

        .search-input::placeholder {
          color: #888;
        }

        .search-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #00bfff;
          font-size: 1.2rem;
        }

        .clear-btn {
          position: absolute;
          right: 3rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #ff4d4d;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          color: #ff6b6b;
          transform: translateY(-50%) scale(1.1);
        }

        /* Category Filter */
        .category-filter {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .category-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 25px;
          background: rgba(26, 26, 26, 0.8);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .category-btn:hover {
          border-color: #00bfff;
          background: rgba(0, 191, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.2);
        }

        .category-btn.active {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-color: transparent;
          color: #000;
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
        }

        /* News Grid */
        .news-grid {
          padding: 2rem 0;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
        }

        .news-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0, 191, 255, 0.1);
          transition: all 0.4s ease;
          position: relative;
          height: 100%;
          backdrop-filter: blur(10px);
        }

        .news-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.5s ease;
          z-index: 1;
        }

        .news-card:hover::before {
          left: 100%;
        }

        .news-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.3);
        }

        .news-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .news-card:hover .news-image {
          transform: scale(1.1);
        }

        .news-content {
          padding: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .news-date {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(45deg, #00ff99, #00bfff);
          color: #000;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .news-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #ffffff;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-description {
          color: #cccccc;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          color: #000;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .read-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 191, 255, 0.3);
          color: #000;
          text-decoration: none;
        }

        /* Pagination */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin: 3rem 0;
          flex-wrap: wrap;
        }

        .pagination-btn {
          padding: 0.75rem 1rem;
          border: 2px solid rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.8);
          color: #ffffff;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #00bfff;
          background: rgba(0, 191, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.2);
        }

        .pagination-btn.active {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border-color: transparent;
          color: #000;
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading and Error States */
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(0, 191, 255, 0.3);
          border-top: 4px solid #00bfff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.2rem;
          color: #cccccc;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .error-icon {
          font-size: 4rem;
          color: #ff4d4d;
          margin-bottom: 1rem;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .error-text {
          font-size: 1.2rem;
          color: #ff4d4d;
          margin-bottom: 2rem;
        }

        .retry-btn {
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #ff4d4d, #ff6b6b);
          color: #ffffff;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 77, 77, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .category-filter {
            gap: 0.5rem;
          }

          .category-btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .news-card {
            margin-bottom: 2rem;
          }

          .pagination-container {
            gap: 0.25rem;
          }

          .pagination-btn {
            padding: 0.5rem 0.75rem;
            min-width: 40px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 576px) {
          .page-title {
            font-size: 1.5rem;
          }

          .search-input {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }

          .news-content {
            padding: 1rem;
          }

          .news-title {
            font-size: 1.1rem;
          }

          .news-description {
            font-size: 0.9rem;
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
      <section className="news-header">
        <div className="container">
          <div className="header-content">
            <h1 className="page-title floating">
              <i className="fas fa-newspaper me-3"></i>
              Financial News Hub
            </h1>
            <p className="page-subtitle fade-in">
              Stay updated with the latest market trends, economic insights, and financial developments
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="controls-section">
        <div className="container">
          <div className="search-container fade-in">
          <input
            type="text"
              className="search-input"
              placeholder="Search for financial news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
            <i className="fas fa-search search-icon"></i>
          {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm("")}>
                <i className="fas fa-times"></i>
            </button>
          )}
        </div>

          <div className="category-filter slide-in">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <i className={category.icon}></i>
                {category.name}
              </button>
            ))}
        </div>
      </div>
      </section>

      {/* News Grid */}
      <section className="news-grid">
        <div className="container">
          <div className="row g-4">
        {getCurrentArticles().map((article, index) => (
              <div className="col-lg-4 col-md-6" key={index}>
                <div className="news-card scale-in">
              <img
                src={article.urlToImage || 'favicon.jpg'}
                    className="news-image"
                alt={article.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250/1a1a1a/00bfff?text=Financial+News';
                    }}
                  />
                  <div className="news-content">
                    <div className="news-date">
                      <i className="fas fa-clock"></i>
                      {formatDate(article.publishedAt)}
                    </div>
                    <h3 className="news-title">{article.title}</h3>
                    <p className="news-description">{article.description}</p>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="read-more-btn"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      Read Full Article
                </a>
              </div>
              </div>
            </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="fade-in">
              {renderPagination()}
            </div>
          )}
        </div>
      </section>
      </div>
  );
}

export default FinancialNews;