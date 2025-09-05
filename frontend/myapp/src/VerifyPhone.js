import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaPhone, FaShieldAlt, FaCheck, FaClock, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

function VerifyPhone() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showRequestButton, setShowRequestButton] = useState(true);
  const [timer, setTimer] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const name = location.state?.name;

  const apiKey = process.env.REACT_APP_SMS_API_KEY;

  useEffect(() => {
    // Add entrance animations with fallback
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 200);
    });
    
    // Fallback to ensure elements are visible
    const fallbackTimer = setTimeout(() => {
      elements.forEach(el => {
        el.classList.add('animate-in');
      });
    }, 0);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  const startTimer = () => {
    setTimer(120); // 2 mins  
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (generatedOtp) {
      // Timer expired
      setShowOtpInput(false);
      setGeneratedOtp(null);
      setShowRequestButton(true);
    }
  }, [timer, generatedOtp]);

  // Handle OTP input visibility
  useEffect(() => {
    if (showOtpInput) {
      setTimeout(() => {
        const otpContainer = document.querySelector('.otp-input-container');
        const otpInputs = document.querySelectorAll('.otp-input');
        if (otpContainer) {
          otpContainer.style.opacity = '1';
          otpContainer.style.visibility = 'visible';
        }
        otpInputs.forEach(input => {
          input.style.opacity = '1';
          input.style.visibility = 'visible';
        });
      }, 100);
    }
  }, [showOtpInput]);

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = value;
      setOtpDigits(newOtpDigits);
      
      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      
      // Update OTP string
      setOtp(newOtpDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRequestCall = async () => {
    if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    const otpCode = generateOtp();
    setGeneratedOtp(otpCode);
    setShowOtpInput(true);
    setShowRequestButton(false);
    startTimer();

    try {
      const response = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/91${mobile}/${otpCode}`);
      const data = await response.json();
      if (data.Status !== 'Success') {
        alert('Failed to send OTP via SMS. Try again.');
        resetUI();
      }
    } catch (error) {
      alert('Network or API error. Please try again.');
      resetUI();
    } finally {
      setIsLoading(false);
    }
    
    // Force animation for OTP input after state change
    setTimeout(() => {
      const otpElements = document.querySelectorAll('.otp-input-container .animate-on-load');
      otpElements.forEach(el => {
        el.classList.add('animate-in');
      });
    }, 100);
  };

const handleMail = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:8000/send-mail/', {
      email: email,
      name: name,
    });

    if (response.data.success) {
      localStorage.setItem('email', email);
      return true; // ✅ indicate success
    } else {
      alert('Error sending OTP: ' + response.data.message);
      return false; // ❌ indicate failure
    }
  } catch (error) {
    console.error('OTP send failed:', error);
    alert('Failed to send OTP. Please try again.');
    return false; // ❌ indicate failure
  }
};

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      alert('Please enter a complete 4-digit OTP');
      return;
    }

    setIsVerifying(true);
    const success = await handleMail(e);
    
  if (success) {
    if (otp === generatedOtp) {
      alert('OTP Verified Successfully!');
      alert('EMAIL VERIFICATION:\nPlease wait for OTP to be sent to your email for verification...\nThank You 😊');
      navigate('/Verify', {
          'state': { email: email, mobile: mobile }
      });
    } else {
      alert('Invalid OTP. Try again.');
    }
  }
    
    setIsVerifying(false);
  };

  const resetUI = () => {
    setShowOtpInput(false);
    setShowRequestButton(true);
    setGeneratedOtp(null);
    setOtp('');
    setOtpDigits(['', '', '', '']);
    setTimer(0);
  };

  const handleGoBack = () => {
    setShowModal(true);
    // Force modal visibility
    setTimeout(() => {
      const modalOverlay = document.querySelector('.modal-overlay');
      const modalContent = document.querySelector('.modal-content');
      if (modalOverlay) {
        modalOverlay.style.opacity = '1';
        modalOverlay.style.visibility = 'visible';
      }
      if (modalContent) {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
      }
    }, 10);
  };

  const confirmGoBack = () => {
    navigate('/Register');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="verify-phone-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .verify-phone-container {
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

        .verify-phone-container::before {
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

        .verify-phone-container > * {
          position: relative;
          z-index: 2;
        }

        /* Ensure OTP inputs are always visible when shown */
        .otp-input-container {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .otp-input-container .otp-input {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .verify-phone-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 3rem;
          width: 100%;
          max-width: 500px;
          border: 2px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .verify-phone-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .verify-phone-card:hover::before {
          left: 100%;
        }

        .verify-phone-card:hover {
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

        .verification-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 255, 153, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          border: 2px solid rgba(0, 191, 255, 0.3);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .verification-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(0, 191, 255, 0.3);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .verification-icon i {
          font-size: 3rem;
          color: #00bfff;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .verification-message {
          text-align: center;
          color: #cccccc;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-label {
          display: block;
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 15px;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .form-input:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
          transform: scale(1.02);
        }

        .form-input::placeholder {
          color: #888888;
          transition: opacity 0.3s ease;
        }

        .form-input:focus::placeholder {
          opacity: 0.7;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #00bfff;
          font-size: 1.1rem;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .form-input:focus + .input-icon {
          color: #00ff99;
          transform: scale(1.1);
        }

        .timer-container {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
          border-radius: 15px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .timer-text {
          color: #FFD700;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .otp-input-container {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .otp-input {
          width: 50px;
          height: 60px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 12px;
          color: #ffffff;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .otp-input:focus {
          outline: none;
          border-color: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
          transform: scale(1.05);
        }

        .otp-input:valid {
          border-color: #00ff99;
          background: rgba(0, 255, 153, 0.1);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .request-button {
          background: linear-gradient(135deg, #ffa500, #ff8c00);
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
          box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
        }

        .request-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .request-button:hover::before {
          left: 100%;
        }

        .request-button:hover {
          background: linear-gradient(135deg, #ff8c00, #ffa500);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 165, 0, 0.4);
        }

        .request-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .verify-button {
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
        }

        .verify-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .verify-button:hover::before {
          left: 100%;
        }

        .verify-button:hover {
          background: linear-gradient(135deg, #00ff99, #00bfff);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .verify-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .back-link {
          text-align: center;
          margin-top: 2rem;
          color: #cccccc;
        }

        .back-link a {
          color: #00bfff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-link a:hover {
          color: #00ff99;
          text-shadow: 0 0 10px rgba(0, 255, 153, 0.5);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(10px);
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
          border-radius: 20px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          border: 2px solid rgba(255, 77, 77, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 10000;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          color: #ff4d4d;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-body {
          color: #cccccc;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .modal-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-button.cancel {
          background: linear-gradient(135deg, #666666, #888888);
          color: #ffffff;
        }

        .modal-button.cancel:hover {
          background: linear-gradient(135deg, #888888, #666666);
          transform: translateY(-2px);
        }

        .modal-button.confirm {
          background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
          color: #ffffff;
        }

        .modal-button.confirm:hover {
          background: linear-gradient(135deg, #ff6b6b, #ff4d4d);
          transform: translateY(-2px);
        }

        /* Animation Classes */
        .animate-on-load {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.4s ease-out;
          animation: fadeInFallback 1s ease-out 0.4s forwards;
        }

        .animate-on-load.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeInFallback {
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .verify-phone-card {
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

          .otp-input-container {
            gap: 0.5rem;
          }

          .otp-input {
            width: 45px;
            height: 55px;
            font-size: 1.3rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .request-button,
          .verify-button {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .verify-phone-card {
            padding: 1.5rem;
            margin: 0.5rem;
          }

          .brand-logo {
            font-size: 1.8rem;
          }

          .otp-input {
            width: 40px;
            height: 50px;
            font-size: 1.2rem;
          }

          .verification-icon {
            width: 80px;
            height: 80px;
          }

          .verification-icon i {
            font-size: 2.5rem;
          }
        }

        /* Enhanced Accessibility */
        .form-input:focus,
        .otp-input:focus,
        .request-button:focus,
        .verify-button:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease;
        }
      `}</style>

      <div className="verify-phone-card animate-on-load">
        <div className="brand-header">
          <h1 className="brand-logo">FINANCOGRAM</h1>
          <p className="brand-subtitle">Phone Verification</p>
          <div className="security-badge">
            <FaShieldAlt />
            <span>SMS OTP Verification</span>
          </div>
        </div>

        <div className="verification-icon animate-on-load fs-1 text-white">
          <FaPhone />
        </div>

        <div className="verification-message animate-on-load">
          Please enter your mobile number to receive a 4-digit verification code via SMS.
          This step is required to complete your registration.
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group animate-on-load">
            <label className="form-label">Mobile Number</label>
            <div className="input-wrapper">
              <input
                type="tel"
                className="form-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
              />
              <FaPhone className="input-icon" />
            </div>
          </div>

          {timer > 0 && (
            <div className="timer-container animate-on-load">
              <div className="timer-text">
                <FaClock />
                OTP expires in: {formatTime(timer)}
              </div>
            </div>
          )}

          {showRequestButton && (
            <div className="action-buttons animate-on-load">
              <button
                type="button"
                className="request-button"
                onClick={handleRequestCall}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <FaPhone />
                    Request OTP
                  </>
                )}
              </button>
            </div>
          )}

          {showOtpInput && (
            <>
              <div className="form-group animate-on-load" style={{ opacity: 1, transform: 'translateY(0)' }}>
                <label className="form-label">Enter OTP</label>
                <div className="otp-input-container">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      required
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <div className="action-buttons animate-on-load" style={{ opacity: 1, transform: 'translateY(0)' }}>
                <button
                  type="submit"
                  className="verify-button"
                  disabled={isVerifying || otp.length !== 4}
                >
                  {isVerifying ? (
                    <>
                      <span className="loading-spinner"></span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Verify OTP
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="back-link animate-on-load">
          <a href="#" onClick={(e) => { e.preventDefault(); handleGoBack(); }}>
            <FaArrowLeft />
            Go Back
          </a>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ opacity: 1, visibility: 'visible' }}>
          <div className="modal-content animate-on-load" style={{ opacity: 1, transform: 'translateY(0)' }}>
            <div className="modal-header">
              <FaExclamationTriangle />
              <h3 className="modal-title">Warning</h3>
            </div>
            <div className="modal-body">
              Going back will reset the registration process. Do you want to continue?
            </div>
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm"
                onClick={confirmGoBack}
              >
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyPhone;
