import React, { useState, useRef, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Link, useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import axios from 'axios'
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaShieldAlt,
  FaUserPlus,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'

function Register () {
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [webcamActive, setWebcamActive] = useState(false)

  const [username, setUsername] = useState('')
  const [isAvailable, setIsAvailable] = useState(null)
  const [validLength, setValidLength] = useState(false)
  const [validPattern, setValidPattern] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Add entrance animations
    const elements = document.querySelectorAll('.animate-on-load')
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in')
      }, index * 200)
    })
  }, [])

  const checkUsername = async value => {
    try {
      const response = await axios.get(
        `http://localhost:8000/check-username?username=${value}`
      )
      setIsAvailable(response.data.available)
    } catch (error) {
      setIsAvailable(false)
    }
  }

  const handleUsernameChange = e => {
    const value = e.target.value
    setUsername(value)
    setAttempted(true)

    const regex = /^\w+$/
    const lengthValid = value.length >= 5 && value.length <= 12

    setValidPattern(regex.test(value))
    setValidLength(lengthValid)

    if (regex.test(value) && lengthValid) {
      checkUsername(value)
    } else {
      setIsAvailable(null)
    }
  }

  const isValid = validLength && validPattern && isAvailable

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImage(imageSrc)
  }

  const toggleWebcam = () => {
    setWebcamActive(!webcamActive)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!capturedImage) {
      alert('Please capture your face first!')
      return
    }

    if (!isValid) {
      alert('Please ensure all fields are valid!')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        ...form,
        username: username,
        face_image: capturedImage
      }

      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      alert(data.status || JSON.stringify(data))

      navigate('/VerifyPhone', {
        state: { email: form.email, name: form.name }
      })
    } catch (error) {
      alert('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='register-container'>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .register-container {
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

        .register-container::before {
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

        .register-container > * {
          position: relative;
          z-index: 2;
        }

        .register-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 3rem;
          width: 100%;
          max-width: 900px;
          border: 2px solid rgba(0, 191, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .register-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .register-card:hover::before {
          left: 100%;
        }

        .register-card:hover {
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

        .form-section {
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

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #888888;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .password-toggle:hover {
          color: #00bfff;
          transform: scale(1.1);
        }

        .validation-list {
          list-style: none;
          padding: 0;
          margin-top: 0.5rem;
          font-size: 0.85rem;
        }

        .validation-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .validation-item.valid {
          color: #00ff99;
          background: rgba(0, 255, 153, 0.1);
        }

        .validation-item.invalid {
          color: #ff4d4d;
          background: rgba(255, 77, 77, 0.1);
        }

        .validation-item.pending {
          color: #888888;
          background: rgba(136, 136, 136, 0.1);
        }

        .webcam-section {
          margin: 2rem 0;
          text-align: center;
        }

        .webcam-toggle {
          background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
          border: none;
          border-radius: 15px;
          padding: 0.75rem 1.5rem;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
        }

        .webcam-toggle:hover {
          background: linear-gradient(135deg, #ff6b6b, #ff4d4d);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 77, 77, 0.4);
        }

        .webcam-container {
          border-radius: 15px;
          overflow: hidden;
          border: 2px solid rgba(0, 191, 255, 0.3);
          transition: all 0.3s ease;
          margin-bottom: 1rem;
          max-width: 400px;
          margin: 0 auto 1rem;
        }

        .webcam-container:hover {
          border-color: rgba(0, 191, 255, 0.5);
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.2);
        }

        .webcam-container video {
          width: 100%;
          border-radius: 15px;
        }

        .captured-image {
          border-radius: 15px;
          border: 2px solid rgba(0, 191, 255, 0.3);
          transition: all 0.3s ease;
        }

        .captured-image:hover {
          border-color: rgba(0, 191, 255, 0.5);
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.2);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 1.5rem 0;
        }

        .capture-button {
          background: linear-gradient(135deg, #00bfff, #00ff99);
          border: none;
          border-radius: 15px;
          padding: 0.75rem 1.5rem;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
        }

        .capture-button:hover {
          background: linear-gradient(135deg, #00ff99, #00bfff);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.4);
        }

        .register-button {
          background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
          border: none;
          border-radius: 15px;
          padding: 0.75rem 1.5rem;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
        }

        .register-button:hover {
          background: linear-gradient(135deg, #ff6b6b, #ff4d4d);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 77, 77, 0.4);
        }

        .register-button:disabled {
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

        .login-link {
          text-align: center;
          margin-top: 2rem;
          color: #cccccc;
        }

        .login-link a {
          color: #00bfff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .login-link a:hover {
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
          .register-card {
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

          .form-input {
            padding: 0.875rem 0.875rem 0.875rem 2.5rem;
            font-size: 0.95rem;
          }

          .input-icon {
            left: 0.875rem;
            font-size: 1rem;
          }

          .password-toggle {
            right: 0.875rem;
            font-size: 1rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .capture-button,
          .register-button {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 1.5rem;
            margin: 0.5rem;
          }

          .brand-logo {
            font-size: 1.8rem;
          }

          .form-input {
            padding: 0.75rem 0.75rem 0.75rem 2.25rem;
            font-size: 0.9rem;
          }

          .input-icon {
            left: 0.75rem;
            font-size: 0.9rem;
          }

          .password-toggle {
            right: 0.75rem;
            font-size: 0.9rem;
          }

          .webcam-toggle {
            padding: 0.625rem 1.25rem;
            font-size: 0.9rem;
          }
        }

        /* Enhanced Accessibility */
        .form-input:focus,
        .capture-button:focus,
        .register-button:focus,
        .webcam-toggle:focus,
        .password-toggle:focus {
          outline: 2px solid #00bfff;
          outline-offset: 2px;
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition: all 0.2s ease;
    }
    `}</style>

      <div className='register-card animate-on-load'>
        <div className='brand-header'>
          <h1 className='brand-logo'>FINANCOGRAM</h1>
          <p className='brand-subtitle'>Create Your Secure Account</p>
          <div className='security-badge'>
            <FaShieldAlt />
            <span>Face Recognition Registration</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-section'>
            <div className='row'>
              <div className='col-md-6'>
                <div className='form-group animate-on-load'>
                  <label className='form-label'>Full Name</label>
                  <div className='input-wrapper'>
                    <input
                      type='text'
                      className='form-input'
                      name='name'
                      placeholder='Enter your full name'
                      onChange={handleChange}
                      required
                    />
                    <FaUser className='input-icon' />
                  </div>
                </div>
              </div>

              <div className='col-md-6'>
                <div className='form-group animate-on-load'>
                  <label className='form-label'>Username</label>
                  <div className='input-wrapper'>
                    <input
                      type='text'
                      className='form-input'
                      name='username'
                      placeholder='Create a unique username'
                      value={username}
                      onChange={handleUsernameChange}
                      required
                    />
                    <FaUser className='input-icon' />
                  </div>
                  {attempted && (
                    <ul className='validation-list'>
                      <li
                        className={`validation-item ${
                          validPattern ? 'valid' : 'invalid'
                        }`}
                      >
                        {validPattern ? <FaCheck /> : <FaTimes />}
                        Only alphanumeric and underscore characters
                      </li>
                      <li
                        className={`validation-item ${
                          validLength ? 'valid' : 'invalid'
                        }`}
                      >
                        {validLength ? <FaCheck /> : <FaTimes />}
                        Length between 5 and 12 characters
                      </li>
                      <li
                        className={`validation-item ${
                          isAvailable === null
                            ? 'pending'
                            : isAvailable
                            ? 'valid'
                            : 'invalid'
                        }`}
                      >
                        {isAvailable === null ? (
                          <FaSpinner className='loading-spinner' />
                        ) : isAvailable ? (
                          <FaCheck />
                        ) : (
                          <FaTimes />
                        )}
                        {isAvailable === null
                          ? 'Checking availability...'
                          : isAvailable
                          ? 'Username available'
                          : 'Username not available'}
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-md-6'>
                <div className='form-group animate-on-load'>
                  <label className='form-label'>Email Address</label>
                  <div className='input-wrapper'>
                    <input
                      type='email'
                      className='form-input'
                      name='email'
                      placeholder='Enter your email address'
                      onChange={handleChange}
                      required
                    />
                    <FaEnvelope className='input-icon' />
                  </div>
                </div>
              </div>

              <div className='col-md-6'>
                <div className='form-group animate-on-load'>
                  <label className='form-label'>Password</label>
                  <div className='input-wrapper'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className='form-input'
                      name='password'
                      placeholder='Create a strong password'
                      onChange={handleChange}
                      required
                    />
                    <FaLock className='input-icon' />
                    <button
                      type='button'
                      className='password-toggle'
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='webcam-section animate-on-load'>
            <button
              type='button'
              className='webcam-toggle'
              onClick={toggleWebcam}
            >
              <FaCamera />
              {webcamActive ? 'Hide Camera' : 'Show Camera'}
            </button>

            {webcamActive && (
              <div className='webcam-container'>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat='image/jpeg'
                  videoConstraints={{ facingMode: 'user' }}
                />
              </div>
            )}

            {capturedImage && (
              <div className='text-center'>
                <img
                  src={capturedImage}
                  alt='Captured'
                  className='captured-image'
                  style={{
                    width: '200px',
                    height: '150px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            <div className='action-buttons'>
              <button
                type='button'
                className='capture-button'
                onClick={capture}
              >
                <FaCamera />
                Capture Face
              </button>

              <button
                className='register-button'
                type='submit'
                disabled={isLoading || !isValid || !capturedImage}
              >
                {isLoading ? (
                  <>
                    <span className='loading-spinner'></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className='login-link animate-on-load'>
          <p>
            Already have an account? <Link to='/Login'>Login Now</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
