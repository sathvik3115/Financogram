// IndicesBar.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';

const IndicesBar = () => {
  const [indices, setIndices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIndices = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:8000/web/indices/');
      setIndices(res.data);
    } catch (err) {
      console.error("Failed to fetch indices", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // refresh every 60 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .indicesbar-container {
          width: 100vw;
          height: 100px;
          overflow-x: auto;
          background-color: transparent;
          padding: 0.5rem 0;
          position: relative;
          display: flex;
          align-items: center;
        }
        .indicesbar-container::-webkit-scrollbar {
          height: 5px;
        }
        .indicesbar-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #00bfff, #00ff99);
          border-radius: 8px;
        }
        .indicesbar-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #00ff99, #00bfff);
        }
        .indicesbar-row {
          width: 100vw;
          display: flex;
          gap: 1.0rem;
          padding: 1rem 1rem;
          justify-content: space-around;
          align-items: center;
          height: 100%;
          flex-wrap: nowrap;
          min-width: max-content;
        }

        .indicesbar-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 80px;
        }

        .indicesbar-spinner-icon {
          font-size: 2rem;
          color: #00bfff;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .index-card {
          width: auto;
          background: linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(42,42,42,0.85) 100%);
          border-radius: 18px;
          box-shadow: 0 2px 10px rgba(0,191,255,0.08);
          border: 1.5px solid rgba(0,191,255,0.18);
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.7rem 1.5rem;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          position: relative;
          overflow: hidden;
        }
        .index-card:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 0 20px rgba(0,191,255,0.18);
          border-color: #00bfff;
        }
        .arrow-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,255,153,0.12), rgba(0,191,255,0.12));
          transition: background 0.3s;
        }
        .index-card.negative .arrow-box {
          background: linear-gradient(135deg, rgba(255,77,77,0.12), rgba(255,107,107,0.12));
        }
        .arrow-up {
          color: #00ff99;
          font-size: 1.5rem;
          animation: arrowBounce 1.2s infinite alternate;
        }
        .arrow-down {
          color: #ff4d4d;
          font-size: 1.5rem;
          animation: arrowBounce 1.2s infinite alternate;
        }
        @keyframes arrowBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }
        .index-info {
          flex: 1;
          min-width: 0;
        }
        .index-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: #fff;
          margin-bottom: 0.1rem;
          letter-spacing: 0.5px;
        }
        .index-values {
          display: flex;
          gap: 0.7rem;
          align-items: center;
        }
        .index-percent {
          font-weight: 700;
          font-size: 1rem;
          color: #00ff99;
          transition: color 0.3s;
        }
        .index-card.negative .index-percent {
          color: #ff4d4d;
        }
        .index-change {
          font-weight: 700;
          font-size: 1rem;
          color: #00bfff;
          transition: color 0.3s;
        }
        .index-card.negative .index-change {
          color: #ff4d4d;
        }
        .index-value {
          color: #cccccc;
          font-size: 0.95rem;
          font-weight: 500;
        }


      `}</style>
      <nav className="indicesbar-container" aria-label="Market Indices">
        {isLoading ? (
          <div className="indicesbar-spinner">
            <FaSpinner className="indicesbar-spinner-icon" />
          </div>
        ) : (
          <div className="indicesbar-row">
            {indices.map((index, idx) => (
              <div
                key={idx}
                className={`index-card col-3${index.change < 0 ? ' negative' : ''}`}
                tabIndex={0}
                aria-label={`${index.name}, value ${index.value}, change ${index.change}, percent ${index.percent}%`}
              >
                <div className="arrow-box">
                  {index.change >= 0 ? (
                    <FaArrowUp className="arrow-up" />
                  ) : (
                    <FaArrowDown className="arrow-down" />
                  )}
                </div>
                <div className="index-info">
                  <div className="index-name">{index.name}</div>
                  <div className="index-values">
                    <span className="index-percent">{index.percent.toFixed(2)}%</span>
                    <span className="index-change">{index.change.toFixed(2)}</span>
                    <span className="index-value">{index.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

export default IndicesBar;
