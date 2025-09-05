import React, { useEffect, useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'

export default function Home () {
  const observerRef = useRef(null)

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.fade-in, .slide-in, .scale-in'
    )
    animatedElements.forEach(el => observerRef.current.observe(el))

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className='finance-landing-page'>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .finance-landing-page {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%);
          overflow: hidden;
        }

        .hero-content {
          text-align: center;
          z-index: 2;
          max-width: 800px;
          padding: 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(0, 191, 255, 0.3);
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: #cccccc;
          margin-bottom: 2rem;
          font-weight: 300;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-block;
        }

        .cta-btn.primary {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          color: #000;
          box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
        }

        .cta-btn.secondary {
          background: transparent;
          color: #00bfff;
          border: 2px solid #00bfff;
        }

        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .cta-btn.primary:hover {
          background: linear-gradient(45deg, #00ff99, #00bfff);
        }

        .cta-btn.secondary:hover {
          background: #00bfff;
          color: #000;
        }

        /* Features Section */
        .features-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
        }

        .section-title {
          text-align: center;
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 3rem;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(0, 191, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.3);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .feature-description {
          color: #cccccc;
          line-height: 1.6;
        }

        /* Why Choose Us Section */
        .why-choose-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
        }

        .why-choose-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .carousel-container {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .carousel-item img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .carousel-item:hover img {
          transform: scale(1.05);
        }

        .benefits-list {
          list-style: none;
        }

        .benefits-list li {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .benefits-list li:hover {
          background: rgba(0, 191, 255, 0.1);
          padding-left: 1rem;
          border-radius: 10px;
        }

        .benefits-list i {
          font-size: 1.5rem;
          margin-right: 1rem;
          color: #00bfff;
          min-width: 30px;
        }

        /* Stats Section */
        .stats-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          border: 1px solid rgba(0, 191, 255, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 191, 255, 0.2);
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: #cccccc;
          font-size: 1.1rem;
          margin-top: 0.5rem;
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
        }

        .testimonial-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(0, 191, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .testimonial-card::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 20px;
          font-size: 4rem;
          color: rgba(0, 191, 255, 0.2);
          font-family: serif;
        }

        .testimonial-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 191, 255, 0.2);
        }

        .testimonial-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #00bfff;
          margin: 0 auto 1rem;
        }

        .testimonial-name {
          font-weight: 600;
          color: #00bfff;
          margin-bottom: 0.5rem;
        }

        .testimonial-text {
          color: #cccccc;
          font-style: italic;
          line-height: 1.6;
        }

        .testimonial-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 1rem;
        }

        /* Blog Section */
        .blog-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
        }

        .blog-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0, 191, 255, 0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .blog-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 191, 255, 0.2);
        }

        .blog-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .blog-card:hover .blog-image {
          transform: scale(1.1);
        }

        .blog-content {
          padding: 1.5rem;
        }

        .blog-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .blog-excerpt {
          color: #cccccc;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .blog-link {
          color: #00bfff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .blog-link:hover {
          color: #00ff99;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .why-choose-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-btn {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }

          .feature-card {
            padding: 1.5rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }

        /* Loading Animation */
        .loading-animation {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 191, 255, 0.3);
          border-radius: 50%;
          border-top-color: #00bfff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

      {/* Hero Section */}
      <section className='hero-section'>

        <div className='hero-content fade-in'>
          <h1 className='hero-title floating'>FINANCOGRAM</h1>
          <p className='hero-subtitle'>
            Your AI-Powered Financial Companion for Smart Investing and Wealth
            Management
          </p>
          <div className='cta-buttons'>
            <a href='#features' className='cta-btn primary pulse'>
              <i className='fas fa-rocket me-2'></i>
              Get Started
            </a>
            <a href='#about' className='cta-btn secondary'>
              <i className='fas fa-play me-2'></i>
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='features-section'>
        <div className='container'>
          <h2 className='section-title fade-in'>Why Choose Financogram?</h2>
          <div className='row'>
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card scale-in'>
                <div className='feature-icon'>
                  <i className='fas fa-shield-alt'></i>
                </div>
                <h3 className='feature-title'>Secure & Encrypted</h3>
                <p className='feature-description'>
                  Bank-level security with end-to-end encryption protecting your
                  financial data and transactions.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card scale-in'>
                <div className='feature-icon'>
                  <i className='fas fa-chart-line'></i>
                </div>
                <h3 className='feature-title'>Real-Time Analytics</h3>
                <p className='feature-description'>
                  Advanced market analytics with interactive charts and
                  real-time data visualization.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card scale-in'>
                <div className='feature-icon'>
                  <i className='fas fa-robot'></i>
                </div>
                <h3 className='feature-title'>AI-Powered Insights</h3>
                <p className='feature-description'>
                  Machine learning algorithms provide personalized investment
                  recommendations and predictions.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card scale-in'>
                <div className='feature-icon'>
                  <i className='fas fa-wallet'></i>
                </div>
                <h3 className='feature-title'>Portfolio Management</h3>
                <p className='feature-description'>
                  Comprehensive portfolio tracking with detailed performance
                  analytics and risk assessment.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card scale-in'>
                <div className='feature-icon'>
                  <i className='fas fa-headset'></i>
                </div>
                <h3 className='feature-title'>24/7 AI Assistant</h3>
                <p className='feature-description'>
                  Personal AI assistant available round the clock to answer your
                  financial queries.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card scale-in'>
                <div className='feature-icon'>
                  <i className='fas fa-newspaper'></i>
                </div>
                <h3 className='feature-title'>Financial News</h3>
                <p className='feature-description'>
                  Latest financial news, market updates, and expert analysis
                  delivered in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id='about' className='why-choose-section'>
        <div className='container'>
          <div className='why-choose-content'>
            <div className='carousel-container slide-in'>
              <div
                id='secondaryCarousel'
                className='carousel slide'
                data-bs-ride='carousel'
              >
                <div className='carousel-inner'>
                  <div className='carousel-item active'>
                    <img src='https://i.pinimg.com/1200x/88/ab/cf/88abcf7932b59b16e2c7ce19482fb24e.jpg' alt='Stock Market Analytics' />
                  </div>
                  <div className='carousel-item'>
                    <img src='https://i.pinimg.com/1200x/6b/0e/c9/6b0ec9189299671157e92909d7023bea.jpg' alt='Portfolio Management' />
                  </div>
                  <div className='carousel-item'>
                    <img src='https://i.pinimg.com/1200x/4c/94/6e/4c946ea68a2a8bfc4679a3a3ada56eb8.jpg' alt='AI Insights' />
                  </div>
                  <div className='carousel-item'>
                    <img src='https://i.pinimg.com/1200x/6f/d5/09/6fd5098ef5a279780af03dfa28fe7df0.jpg' alt='Financial Tools' />
                  </div>
                </div>
                <button
                  className='carousel-control-prev'
                  type='button'
                  data-bs-target='#secondaryCarousel'
                  data-bs-slide='prev'
                >
                  <span className='carousel-control-prev-icon'></span>
                </button>
                <button
                  className='carousel-control-next'
                  type='button'
                  data-bs-target='#secondaryCarousel'
                  data-bs-slide='next'
                >
                  <span className='carousel-control-next-icon'></span>
                </button>
              </div>
            </div>
            <div className='fade-in'>
              <h2 className='section-title'>Advanced Features</h2>
              <ul className='benefits-list'>
                <li>
                  <i className='fas fa-lock'></i>
                  <span>Military-grade encryption for all transactions</span>
                </li>
                <li>
                  <i className='fas fa-chart-bar'></i>
                  <span>Real-time market data and analytics</span>
                </li>
                <li>
                  <i className='fas fa-brain'></i>
                  <span>AI-powered investment recommendations</span>
                </li>
                <li>
                  <i className='fas fa-mobile-alt'></i>
                  <span>Cross-platform mobile and web access</span>
                </li>
                <li>
                  <i className='fas fa-clock'></i>
                  <span>24/7 customer support and AI assistance</span>
                </li>
                <li>
                  <i className='fas fa-graduation-cap'></i>
                  <span>Educational resources and tutorials</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='stats-section'>
        <div className='container'>
          <h2 className='section-title fade-in'>Our Impact</h2>
          <div className='row'>
            <div className='col-lg-3 col-md-6'>
              <div className='stat-card scale-in'>
                <div className='stat-number'>50K+</div>
                <div className='stat-label'>Active Users</div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6'>
              <div className='stat-card scale-in'>
                <div className='stat-number'>$2B+</div>
                <div className='stat-label'>Portfolio Value</div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6'>
              <div className='stat-card scale-in'>
                <div className='stat-number'>99.9%</div>
                <div className='stat-label'>Uptime</div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6'>
              <div className='stat-card scale-in'>
                <div className='stat-number'>24/7</div>
                <div className='stat-label'>Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='testimonials-section'>
        <div className='container'>
          <h2 className='section-title fade-in'>What Our Users Say</h2>
          <div className='row'>
            <div className='col-lg-4 col-md-6'>
              <div className='testimonial-card scale-in'>
                <img
                  src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMANOKajpJUS9D-MwSlrktoqsocHLJ_WjUFQ&s'
                  alt='Sundar Pichai'
                  className='testimonial-avatar'
                />
                <h4 className='testimonial-name'>Sundar Pichai</h4>
                <p className='testimonial-text'>
                  "Financogram revolutionized my investment strategy. The AI
                  insights are incredibly accurate!"
                </p>
                <span
                  className='testimonial-badge'
                  style={{ background: '#ff4d4d', color: '#fff' }}
                >
                  Premium
                </span>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='testimonial-card scale-in'>
                <img
                  src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZTwdahQ0fnaT5hbTIUYXaSEFrsAFDJIfgfA&s'
                  alt='Jeff Bezos'
                  className='testimonial-avatar'
                />
                <h4 className='testimonial-name'>Jeff Bezos</h4>
                <p className='testimonial-text'>
                  "The portfolio management tools are exceptional. Highly
                  recommended for serious investors."
                </p>
                <span
                  className='testimonial-badge'
                  style={{ background: '#00bfff', color: '#fff' }}
                >
                  Verified
                </span>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='testimonial-card scale-in'>
                <img
                  src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ_jG5Q-xbFfYNrVZf-wcs9C0uKIBkrtVW7w&s'
                  alt='Elon Musk'
                  className='testimonial-avatar'
                />
                <h4 className='testimonial-name'>Elon Musk</h4>
                <p className='testimonial-text'>
                  "The real-time analytics and AI predictions have transformed
                  my trading approach."
                </p>
                <span
                  className='testimonial-badge'
                  style={{ background: '#00ff99', color: '#000' }}
                >
                  Official
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className='blog-section'>
        <div className='container'>
          <h2 className='section-title fade-in'>Latest Financial Insights</h2>
          <div className='row'>
            <div className='col-lg-4 col-md-6'>
              <div className='blog-card scale-in'>
                <img
                  src='https://i.pinimg.com/1200x/b7/c7/f2/b7c7f2f34814e6a1e594efe842a16db8.jpg'
                  alt='alt'
                  className='blog-image'
                />
                <div className='blog-content'>
                  <h3 className='blog-title'>AI Revolution in Portfolio Management</h3>
                  <p className='blog-excerpt'>
                    Discover how machine learning algorithms are transforming investment strategies, 
                    providing real-time market analysis and automated portfolio rebalancing for optimal returns.
                  </p>
                  <a href='#' className='blog-link'>
                    Read Full Analysis →
                  </a>
                </div>
              </div>
            </div>

            <div className='col-lg-4 col-md-6'>
              <div className='blog-card scale-in'>
                <img
                  src='https://i.pinimg.com/1200x/5b/b0/f4/5bb0f4b6e8e139d1f29538d5a2ca534c.jpg'
                  alt='alt'
                  className='blog-image'
                />
                <div className='blog-content'>
                  <h3 className='blog-title'>ESG Investing: The Future of Wealth Building</h3>
                  <p className='blog-excerpt'>
                    Explore how Environmental, Social, and Governance factors are reshaping investment 
                    decisions and creating new opportunities in renewable energy and sustainable businesses.
                  </p>
                  <a href='#' className='blog-link'>
                    Learn More →
                  </a>
                </div>
              </div>
            </div>

            <div className='col-lg-4 col-md-6'>
              <div className='blog-card scale-in'>
                <img
                  src='https://i.pinimg.com/1200x/f0/df/ce/f0dfce738671e1908eb0b9d5f7f833e4.jpg'
                  alt='alt'
                  className='blog-image'
                />
                <div className='blog-content'>
                  <h3 className='blog-title'>Stock Markets: Explore Historic Performance</h3>
                  <p className='blog-excerpt'>
                    Analyze emerging trends in decentralized finance, future performance, and the 
                    growing institutional adoption of blockchain technology in traditional markets.
                  </p>
                  <a href='#' className='blog-link'>
                    Explore Trends →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
