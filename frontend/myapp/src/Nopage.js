import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

function Nopage() {
  useEffect(() => {
    // Add entrance animations
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 200);
    });
  }, []);

  return (
    <div className="nopage-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .nopage-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }

        .nopage-container::before {
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

        .nopage-container > * {
          position: relative;
          z-index: 2;
        }

        .nopage-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 3rem;
          width: 100%;
          max-width: 600px;
          border: 2px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          text-align: center;
        }

        .nopage-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .nopage-card:hover::before {
          left: 100%;
        }

        .nopage-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          border-color: rgba(0, 191, 255, 0.4);
        }

        .brand-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brand-logo {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from { filter: drop-shadow(0 0 20px rgba(0, 191, 255, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(0, 255, 153, 0.5)); }
        }

        .brand-subtitle {
          color: #cccccc;
          font-size: 1.1rem;
          font-weight: 300;
          margin-bottom: 1rem;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 255, 153, 0.1));
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 20px;
          padding: 0.5rem 1rem;
          color: #00bfff;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .error-icon {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 77, 77, 0.2), rgba(255, 107, 107, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          border: 3px solid rgba(255, 77, 77, 0.3);
          transition: all 0.3s ease;
          animation: errorPulse 2s infinite;
        }

        .error-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 0 40px rgba(255, 77, 77, 0.4);
        }

        @keyframes errorPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .error-icon i {
          font-size: 4rem;
          color: #ff4d4d;
          animation: errorShake 3s ease-in-out infinite;
        }

        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .error-code {
          font-size: 6rem;
          font-weight: 900;
          background: linear-gradient(45deg, #ff4d4d, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          animation: errorGlow 2s ease-in-out infinite alternate;
        }

        @keyframes errorGlow {
          from { filter: drop-shadow(0 0 20px rgba(255, 77, 77, 0.5)); }
          to { filter: drop-shadow(0 0 30px rgba(255, 107, 107, 0.5)); }
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .error-message {
          color: #cccccc;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .home-button {
          background: linear-gradient(135deg, #00bfff, #00ff99);
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
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
          text-decoration: none;
        }

        .home-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .home-button:hover::before {
          left: 100%;
        }

        .home-button:hover {
          background: linear-gradient(135deg, #00ff99, #00bfff);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .back-button {
          background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
          border: none;
          border-radius: 15px;
          padding: 1rem 2rem;
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
          text-decoration: none;
        }

        .back-button:hover {
          background: linear-gradient(135deg, #ff6b6b, #ff4d4d);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 77, 77, 0.4);
        }


        /* Animation Classes */
        .animate-on-load {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .animate-on-load.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nopage-card {
            margin: 1rem;
            padding: 2rem;
            border-radius: 20px;
          }

          .brand-logo {
            font-size: 2rem;
          }

          .brand-subtitle {
            font-size: 1rem;
          }

          .error-code {
            font-size: 4rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-icon {
            width: 120px;
            height: 120px;
          }

          .error-icon i {
            font-size: 3rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .home-button,
          .back-button {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .nopage-card {
            padding: 1.5rem;
            margin: 0.5rem;
          }

          .brand-logo {
            font-size: 1.8rem;
          }

          .error-code {
            font-size: 3rem;
          }

          .error-title {
            font-size: 1.3rem;
          }

          .error-icon {
            width: 100px;
            height: 100px;
          }

          .error-icon i {
            font-size: 2.5rem;
          }
        }

        /* Enhanced Accessibility */
        .home-button:focus,
        .back-button:focus,
        .search-input:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease;
        }
      `}</style>


      <div className="nopage-card animate-on-load">
        <div className="brand-header">
          <h1 className="brand-logo">FINANCOGRAM</h1>
          <p className="brand-subtitle">Page Not Found</p>
          <div className="security-badge">
            <FaShieldAlt />
            <span>Secure Navigation</span>
          </div>
        </div>

        <div className="error-icon animate-on-load">
          <FaExclamationTriangle className='fs-1'/>
        </div>

        <div className="error-code animate-on-load">404</div>
        
        <h2 className="error-title animate-on-load">Page Not Found</h2>
        
        <p className="error-message animate-on-load">
          Sorry, the page you are looking for does not exist or has been moved. 
          Please check the URL or use the navigation below to find what you're looking for.
        </p>

        <div className="action-buttons animate-on-load">
          <Link to="/" className="home-button">
            <FaHome />
            Go Home
          </Link>
          
          <button 
            className="back-button"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}

export default Nopage;
