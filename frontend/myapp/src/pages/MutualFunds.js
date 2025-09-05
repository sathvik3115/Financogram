// MutualFunds.js
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import {
  FaSearch,
  FaChartLine,
  FaShieldAlt,
  FaMoneyBillWave,
  FaArrowUp,
  FaInfoCircle,
  FaStar,
  FaArrowRight
} from 'react-icons/fa'

const MutualFunds = () => {
  const [funds, setFunds] = useState([])
  const [filteredFunds, setFilteredFunds] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const articlesPerPage = 12

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/web/mutual-funds/`)
        setFunds(res.data)
        setFilteredFunds(res.data)
        setTotalPages(Math.ceil(res.data.length / articlesPerPage))
      } catch (error) {
        console.error('Failed to fetch mutual funds', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFunds()
  }, [])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Observe all fade-in elements
    const animatedElements = document.querySelectorAll('.fade-in')
    animatedElements.forEach(el => observer.observe(el))

    // Fallback: ensure all elements become visible after a delay
    const fallbackTimer = setTimeout(() => {
      const allAnimatedElements = document.querySelectorAll('.fade-in')
      allAnimatedElements.forEach(el => {
        if (!el.classList.contains('animate-in')) {
          el.classList.add('animate-in')
        }
      })
    }, 2000)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleSearch = e => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)
    filterFunds(value, selectedCategory)
  }

  const handleCategoryFilter = category => {
    setSelectedCategory(category)
    filterFunds(searchTerm, category)
  }

  const filterFunds = (search, category) => {
    let filtered = funds.filter(fund => {
      const matchesSearch =
        fund.name.toLowerCase().includes(search.toLowerCase()) ||
        (fund.category &&
          fund.category.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory = category === 'all' || fund.category === category

      return matchesSearch && matchesCategory
    })
    setFilteredFunds(filtered)
    setCurrentPage(1)
    setTotalPages(Math.ceil(filtered.length / articlesPerPage))

    // Re-observe new elements after filtering
    setTimeout(() => {
      const newAnimatedElements = document.querySelectorAll('.fade-in')
      newAnimatedElements.forEach(el => {
        if (!el.classList.contains('animate-in')) {
          const observer = new IntersectionObserver(
            entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('animate-in')
                }
              })
            },
            { threshold: 0.1 }
          )
          observer.observe(el)
        }
      })
    }, 100)
  }

  const getCategories = () => {
    const categories = [
      ...new Set(funds.map(fund => fund.category).filter(Boolean))
    ]
    return categories
  }

  const getRiskColor = risk => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return '#00ff99'
      case 'moderate':
        return '#ffaa00'
      case 'high':
        return '#ff4d4d'
      default:
        return '#cccccc'
    }
  }

  const getCurrentFunds = () => {
    const startIndex = (currentPage - 1) * articlesPerPage
    return filteredFunds.slice(startIndex, startIndex + articlesPerPage)
  }

  const renderPagination = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible) start = Math.max(1, end - maxVisible + 1)

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      )
    }

    return (
      <div className='pagination-container'>
        <button
          className='pagination-btn'
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className='fas fa-chevron-left'></i>
        </button>
        {pages}
        <button
          className='pagination-btn'
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className='fas fa-chevron-right'></i>
        </button>
      </div>
    )
  }

  return (
    <div className='mutual-funds-container'>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .mutual-funds-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .mutual-funds-container::before {
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

        .mutual-funds-container > * {
          position: relative;
          z-index: 2;
        }

        .page-header {
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

        .stats-grid {
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
          font-size: 2rem;
          font-weight: 700;
          color: #00bfff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #cccccc;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .search-section {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .search-input {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          padding: 1rem 1rem 1rem 3rem;
          color: #ffffff;
          font-size: 1rem;
          width: 100%;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
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
          font-style: italic;
        }

        .search-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #00bfff;
          font-size: 1.1rem;
          z-index: 2;
        }

        .category-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-btn {
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

        .category-btn:hover,
        .category-btn.active {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
        }

        .funds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          padding: 0 1rem;
        }

        .fund-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 2px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .fund-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .fund-card:hover::before {
          left: 100%;
        }

        .fund-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0, 191, 255, 0.3);
          border-color: rgba(0, 191, 255, 0.5);
        }

        .fund-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .fund-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .fund-category {
          color: #00bfff;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .risk-badge {
          background: linear-gradient(135deg, rgba(255, 77, 77, 0.2), rgba(255, 107, 107, 0.2));
          border: 1px solid rgba(255, 77, 77, 0.3);
          border-radius: 15px;
          padding: 0.3rem 0.8rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #ff4d4d;
          backdrop-filter: blur(10px);
        }

        .fund-details {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-label {
          color: #cccccc;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-value {
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
        }

        .nav-value {
          color: #00ff99;
          font-weight: 700;
        }

        .returns-value {
          color: #00bfff;
          font-weight: 700;
        }

        .investment-value {
          color: #ffaa00;
          font-weight: 700;
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

        .no-results {
          text-align: center;
          color: #cccccc;
          font-size: 1.2rem;
          padding: 3rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2.5rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
          }

          .funds-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .search-section {
            padding: 1.5rem;
            margin: 1rem;
          }

          .category-filters {
            gap: 0.3rem;
          }

          .category-btn {
            font-size: 0.8rem;
            padding: 0.4rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .fund-card {
            padding: 1.5rem;
          }

          .fund-name {
            font-size: 1.1rem;
          }
        }

        /* Enhanced Accessibility */
        .invest-button:focus,
        .search-input:focus,
        .category-btn:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
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

        /* Animation Classes */
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
          animation: fadeInFallback 1s ease-out 0.5s forwards;
        }

        .fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeInFallback {
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }
    `}</style>

      <div className='page-header'>
        <div className='header-content'>
          <h1 className='page-title'>Mutual Funds</h1>
          <p className='page-subtitle'>
            Discover and invest in the best mutual funds for your financial
            goals
          </p>

          <div className='stats-grid'>
            <div className='stat-card'>
              <div className='stat-number'>{funds.length}</div>
              <div className='stat-label'>Total Funds</div>
            </div>
            <div className='stat-card'>
              <div className='stat-number'>{getCategories().length}</div>
              <div className='stat-label'>Categories</div>
            </div>
            <div className='stat-card'>
              <div className='stat-number'>{filteredFunds.length}</div>
              <div className='stat-label'>Available</div>
            </div>
          </div>
        </div>
      </div>

      <Container>
        <div className='search-section'>
          <div className='search-wrapper'>
            <FaSearch className='search-icon' />
            <input
              type='text'
              className='search-input'
              placeholder='Search by fund name or category...'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className='category-filters'>
            <button
              className={`category-btn ${
                selectedCategory === 'all' ? 'active' : ''
              }`}
              onClick={() => handleCategoryFilter('all')}
            >
              All Categories
            </button>
            {getCategories().map(category => (
              <button
                key={category}
                className={`category-btn ${
                  selectedCategory === category ? 'active' : ''
                }`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className='no-results'>
            <FaInfoCircle
              style={{
                fontSize: '3rem',
                color: '#888888',
                marginBottom: '1rem'
              }}
            />
            <p>No mutual funds found matching your criteria.</p>
            <p>Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          <div className='funds-grid'>
            {getCurrentFunds().map(fund => (
              <div key={fund.id} className='fund-card'>
                <div className='fund-header'>
                  <div>
                    <h3 className='fund-name'>{fund.name}</h3>
                    <div className='fund-category'>
                      <FaChartLine /> {fund.category || 'Unknown Category'}
                    </div>
                  </div>
                  <div
                    className='risk-badge'
                    style={{
                      borderColor: getRiskColor(fund.risk),
                      color: getRiskColor(fund.risk)
                    }}
                  >
                    <FaShieldAlt /> {fund.risk || 'N/A'}
                  </div>
                </div>

                <div className='fund-details'>
                  <div className='detail-row'>
                    <span className='detail-label'>
                      <FaMoneyBillWave /> NAV
                    </span>
                    <span className='detail-value nav-value'>
                      ₹{fund.nav.toFixed(2)}
                    </span>
                  </div>

                  <div className='detail-row'>
                    <span className='detail-label'>
                      <FaArrowUp /> 5Y Returns
                    </span>
                    <span className='detail-value returns-value'>
                      {fund.returns ? `${fund.returns}%` : 'N/A'}
                    </span>
                  </div>

                  <div className='detail-row'>
                    <span className='detail-label'>
                      <FaStar /> Min Investment
                    </span>
                    <span className='detail-value investment-value'>
                      ₹{fund.min_investment}
                    </span>
                  </div>
                </div>

                <button
                  className='invest-button'
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `https://api.mfapi.in/mf/${fund.id}`
                      )
                      const json = await res.json()

                      const navData = json.data || []

                      // Check if at least one of the latest 3 dates is within the last 3 calendar days
                      const recentNavs = navData.slice(0, 3) // Get latest 3 NAV entries
                      const today = new Date()

                      const validRecent = recentNavs.some(entry => {
                        const navDate = new Date(
                          entry.date.split('-').reverse().join('-')
                        )
                        const diffDays = Math.floor(
                          (today - navDate) / (1000 * 60 * 60 * 24)
                        )
                        return diffDays <= 3
                      })

                      if (!validRecent) {
                        alert(
                          `${fund.name} has been closed. It is no longer accepting any fresh investments.\n\nLast Active Date: ${recentNavs[0].date}`
                        )
                        return
                      }

                      // All good → redirect
                      window.location.href = `/MutualFunds/${fund.id}`
                    } catch (err) {
                      console.error('Failed to validate fund NAV:', err)
                      alert('Something went wrong while checking fund data.')
                    }
                  }}
                >
                  <FaArrowRight />
                  Invest Now
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && <div className='fade-in'>{renderPagination()}</div>}
      </Container>
    </div>
  )
}

export default MutualFunds
