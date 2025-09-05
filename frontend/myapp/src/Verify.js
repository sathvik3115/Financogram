import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import {
  FaShieldAlt,
  FaCheck,
  FaClock,
  FaArrowLeft,
  FaKey
} from 'react-icons/fa'

const Verify = () => {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(120)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const navigate = useNavigate()
  const email = localStorage.getItem('email')
  const location = useLocation()
  const mobile = location.state?.mobile

  useEffect(() => {
    // Add entrance animations
    const elements = document.querySelectorAll('.animate-on-load')
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in')
      }, index * 200)
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' + s : s}`
  }

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpDigits = [...otpDigits]
      newOtpDigits[index] = value
      setOtpDigits(newOtpDigits)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        if (nextInput) nextInput.focus()
      }

      // Update OTP string
      setOtp(newOtpDigits.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerify = async e => {
    e.preventDefault()

    if (otp.length !== 6) {
      alert('Please enter a complete 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/verify-otp/`, {
        mobile,
        email,
        otp
      })

      if (response.data.success) {
        alert(
          'OTP Verified Successfully!\nRegistration Completed Successfully ✅, Login to get started... 🚀'
        )
        localStorage.removeItem('email')
        navigate('/Login')
      } else {
        alert(response.data.message)
      }
    } catch (err) {
      console.error('Error verifying OTP:', err)
      alert('Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/send-mail/`, {
        email
      })

      if (response.data.success) {
        alert('OTP resent successfully!')
        setTimer(120) // restart timer
        setOtpDigits(['', '', '', '', '', ''])
        setOtp('')
      } else {
        alert(response.data.message)
      }
    } catch (err) {
      console.error('Error resending OTP:', err)
      alert('Could not resend OTP.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="verify-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .verify-container {
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

        .verify-container::before {
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

        .verify-container > * {
          position: relative;
          z-index: 2;
        }

        .verify-card {
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

        .verify-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .verify-card:hover::before {
          left: 100%;
        }

        .verify-card:hover {
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

        .timer-container {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
          border-radius: 15px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .timer-container.expired {
          background: linear-gradient(135deg, rgba(0, 255, 153, 0.1), rgba(0, 191, 255, 0.1));
          border: 1px solid rgba(0, 255, 153, 0.3);
          transform: translateY(0)!important;
          opacity: 1!important;

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

        .timer-text.expired {
          color: #00ff99;
        }

        .otp-input-container {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
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

        .resend-button {
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
        }

        .resend-button:hover {
          background: linear-gradient(135deg, #ff6b6b, #ff4d4d);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 77, 77, 0.4);
        }

        .resend-button:disabled {
          opacity: 0.5;
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
          .verify-card {
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

          .verify-button,
          .resend-button {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .verify-card {
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
        .otp-input:focus,
        .verify-button:focus,
        .resend-button:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease;
        }
      `}</style>

      <div className="verify-card animate-on-load">
        <div className="brand-header">
          <h1 className="brand-logo">FINANCOGRAM</h1>
          <p className="brand-subtitle">Email Verification</p>
          <div className="security-badge">
            <FaShieldAlt />
            <span>Secure OTP Verification</span>
          </div>
        </div>

        <div className="verification-icon animate-on-load">
          <i className="fa-solid fa-envelope"></i>
        </div>

        <div className="verification-message animate-on-load">
          We have sent a 6-digit verification code to your registered email
          address. Please enter the code below to complete your registration.
        </div>

        <div
          className={`timer-container animate-on-load ${
            timer === 0 ? "expired" : ""
          }`}
        >
          <div className={`timer-text ${timer === 0 ? "expired" : ""}`}>
            <FaClock />
            {timer > 0 ? (
              <>Resend OTP in {formatTime(timer)}</>
            ) : (
              <>
                <span style={{ color: "red" }}>OTP Expired!</span> You can now
                resend the OTP
              </>
            )}{" "}
          </div>
        </div>

        <form onSubmit={handleVerify}>
          <div className="otp-input-container animate-on-load">
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

          <div className="action-buttons animate-on-load">
            <button
              type="submit"
              className="verify-button"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
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

            <button
              type="button"
              className="resend-button"
              onClick={handleResend}
              disabled={timer > 0 || isResending}
            >
              {isResending ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <FaKey />
                  Resend OTP
                </>
              )}
            </button>
          </div>
        </form>

        <div className="back-link animate-on-load">
          <a href="/Register">
            <FaArrowLeft />
            Back to Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default Verify
