import React, { useEffect, useState } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import "jspdf-autotable";
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Badge
} from 'react-bootstrap'
import {
  FaUser,
  FaPhone,
  FaWallet,
  FaChartLine,
  FaShieldAlt,
  FaEdit,
  FaSignOutAlt,
  FaPlus,
  FaMinus,
  FaDownload,
  FaCog,
  FaBell,
  FaStar,
  FaTrophy,
  FaChartBar,
  FaChartPie,
  FaPercentage,
  FaRedo,
  FaCalendar,
  FaUserPlus,
  FaWhatsapp
} from 'react-icons/fa'
import 'bootstrap/dist/css/bootstrap.min.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [walletAmount, setWalletAmount] = useState('')
  const [transactionType, setTransactionType] = useState('add')
  const [editForm, setEditForm] = useState({})
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })
  const [preview, setPreview] = useState(null)
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState({
    totalInvestment: 0,
    currentValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    activeFunds: 0
  })

  const email = localStorage.getItem('user_email')

  useEffect(() => {
    if (!email) return
    fetchUserProfile()
    fetchPortfolioData()
  }, [email])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8000/user-profile/?email=${email}`
      )
      if (!response.ok) throw new Error('Failed to fetch user')
      const data = await response.json()
      setUser(data)
      setEditForm({
        name: data.name || '',
        mobile: data.mobile || '',
        username: data.username || '',
        profile_image: data.profile_image || '',
      })
    } catch (err) {
      console.error('Error fetching user:', err)
      setAlert({
        show: true,
        message: 'Failed to load profile',
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioData = async () => {
    try {
      const email = localStorage.getItem('user_email')
      if (!email) return

      const res = await axios.get(`http://localhost:8000/web/investments/?email=${email}`)
      const dataWithNAV = await Promise.all(
        res.data.map(async (inv) => {
          try {
            const navRes = await axios.get(`https://api.mfapi.in/mf/${inv.fund_id}`)
            const latestNAV = navRes.data.data?.[0]?.nav || inv.nav
            const currentValue = parseFloat(latestNAV) * (inv.amount / inv.nav)
            
            return {
              ...inv,
              currentValue: currentValue.toFixed(2)
            }
          } catch (err) {
            return { 
              ...inv, 
              currentValue: inv.amount
            }
          }
        })
      )

      const totalInvestment = dataWithNAV.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
      const totalCurrent = dataWithNAV.reduce((sum, inv) => sum + parseFloat(inv.currentValue || 0), 0)
      const totalReturn = totalCurrent - totalInvestment
      const totalReturnPercent = totalInvestment > 0 ? ((totalReturn / totalInvestment) * 100) : 0
      const activeFunds = dataWithNAV.length

      setPortfolioData({
        totalInvestment,
        currentValue: totalCurrent,
        totalReturn,
        totalReturnPercent,
        activeFunds
      })
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err)
    }
  }

  const handleWalletTransaction = async () => {
    try {
      const amount = parseFloat(walletAmount)
      if (isNaN(amount) || amount <= 0) {
        setAlert({
          show: true,
          message: 'Please enter a valid amount',
          type: 'warning'
        })
        return
      }

      const response = await fetch(`http://localhost:8000/update-wallet/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          amount: transactionType === 'add' ? amount : -amount
        })
      })

      if (response.ok) {
        setAlert({
          show: true,
          message: `Successfully ${
            transactionType === 'add' ? 'added' : 'withdrawn'
          } ₹${amount}`,
          type: 'success'
        })
        setShowWalletModal(false)
        setWalletAmount('')
        fetchUserProfile() // Refresh user data
      } else {
        throw new Error('Transaction failed')
      }
    } catch (err) {
      setAlert({
        show: true,
        message: 'Transaction failed. Please try again.',
        type: 'danger'
      })
    }
  }
  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm({ ...editForm, profile_image: reader.result }) // this is base64 string
        setPreview(reader.result)
      }
      reader.readAsDataURL(file) // convert to base64
    }
  }

  const handleEditProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8000/update-profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          ...editForm
        })
      })

      if (response.ok) {
        setAlert({
          show: true,
          message: 'Profile updated successfully',
          type: 'success'
        })
        setShowEditModal(false)
        setPreview(null)
        fetchUserProfile() // Refresh user data
      } else {
        throw new Error('Update failed')
      }
    } catch (err) {
      setAlert({
        show: true,
        message: 'Failed to update profile',
        type: 'danger'
      })
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    fetch('http://localhost:8000/logout/', {
      method: 'POST',
      credentials: 'include',
    });
    setShowModal(false);
    navigate('/');
  };

  const handleDownloadStatement = async () => {
    try {
      if (!email) {
        alert('Please login to download your statement')
        return
      }

      const res = await axios.get(`http://localhost:8000/web/investments/?email=${email}`)
      const investments = Array.isArray(res.data) ? res.data : []

      const doc = new jsPDF({ unit: 'pt' })
      const marginLeft = 40
      let y = 60

      // Header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('Portfolio Statement', marginLeft, y)
      y += 22
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Name: ${user?.name || ''}`, marginLeft, y)
      y += 14
      doc.text(`Email: ${user?.email || ''}`, marginLeft, y)
      y += 14
      doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, y)

      // Summary
      y += 24
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Summary:', marginLeft, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      y += 16
      doc.text(`Total Investment: Rs. ${portfolioData.totalInvestment.toLocaleString('en-IN')}`, marginLeft, y)
      y += 14
      doc.text(`Current Value: Rs. ${portfolioData.currentValue.toLocaleString('en-IN')}`, marginLeft, y)
      y += 14
      const returnsText = `${portfolioData.totalReturnPercent.toFixed(2)}% (${portfolioData.totalReturn >= 0 ? '+ Rs. ' : ''}${portfolioData.totalReturn.toLocaleString('en-IN')})`
      doc.text(`Total Return: ${returnsText}`, marginLeft, y)
      y += 14
      doc.text(`Active Funds: ${portfolioData.activeFunds}`, marginLeft, y)

      // Investments table (simple)
      y += 24
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Investments:', marginLeft, y)
      y += 16
      doc.setLineWidth(1)
      doc.line(marginLeft, y, marginLeft + 500, y)
      y += 16
      doc.setFontSize(10)

      const headers = ['Fund Name', 'Fund ID', 'Amount', 'Date']
      const colsX = [marginLeft, marginLeft + 320, marginLeft + 380, marginLeft + 440]
      headers.forEach((h, i) => doc.text(h, colsX[i], y))
      y += 8
      doc.setLineWidth(1)
      doc.line(marginLeft, y, marginLeft + 500, y)
      y += 16

      const pageH = doc.internal.pageSize.getHeight()
      const lineH = 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      investments.forEach(inv => {
        const name = String(inv.name || '')
        const wrapped = doc.splitTextToSize(name, 300)
        const rowH = Math.max(lineH, wrapped.length * lineH)

        if (y + rowH + 40 > pageH) {
          doc.addPage()
          y = 60
          doc.setFont('helvetica', 'bold')
          doc.text('Investments (contd.)', marginLeft, y)
          y += 18
          doc.setFontSize(10)
          headers.forEach((h, i) => doc.text(h, colsX[i], y))
          y += 8
          doc.setLineWidth(0.5)
          doc.line(marginLeft, y, marginLeft + 500, y)
          y += 16
          doc.setFont('helvetica', 'normal')
        }

        wrapped.forEach((line, idx) => doc.text(line, colsX[0], y + idx * lineH))
        doc.text(String(inv.fund_id || ''), colsX[1], y)
        doc.text(String(Number(inv.amount || 0).toLocaleString('en-IN')), colsX[2], y)
        doc.text(String(inv.date || ''), colsX[3], y)

        y += rowH + 8
        
      })
      y -= 8
      doc.setLineWidth(1)
      doc.line(marginLeft, y, marginLeft + 500, y)

      const fileName = `Portfolio_Statement_${(user?.name || 'User').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error('Failed to generate statement:', err)
      alert('Failed to generate statement. Please try again later.')
    }
  }

  if (!email) {
    return (
      <div className='profile-login-required'>
        <style>{`
          .profile-login-required {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
            min-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          .login-card {
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 191, 255, 0.2);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .login-btn {
            background: linear-gradient(45deg, #00bfff, #00ff99);
            border: none;
            border-radius: 10px;
            padding: 0.75rem 2rem;
            color: #000;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
            color: #000;
            text-decoration: none;
          }
        `}</style>
        <div className='login-card'>
          <FaUser
            className='mb-4'
            style={{ fontSize: '4rem', color: '#00bfff' }}
          />
          <h2 className='mb-3'>Login Required!</h2>
          <p className='text-light mb-4'>
            Please login to access your profile...
          </p>
          <Button
            className='login-btn'
            onClick={() => (window.location.href = '/Login')}
          >
            <FaSignOutAlt className='me-2' />
            Login
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='profile-loading'>
        <style>{`
          .profile-loading {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
            min-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(0, 191, 255, 0.3);
            border-top: 4px solid #00bfff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className='text-center'>
          <div className='loading-spinner mb-3'></div>
          <h4>Loading Profile...</h4>
          <p className='text-light'>Fetching your financial data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='profile-error'>
        <style>{`
          .profile-error {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          .error-card {
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 77, 77, 0.2);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
        `}</style>
        <div className='error-card'>
          <FaShieldAlt
            className='mb-4'
            style={{ fontSize: '4rem', color: '#ff4d4d' }}
          />
          <h2 className='mb-3'>Profile Not Found</h2>
          <p className='text-light mb-4'>
            Unable to load your profile. Please try again.
          </p>
          <Button
            variant='outline-light'
            onClick={fetchUserProfile}
            className='me-2'
          >
            <FaRedo className='me-2' />
            Retry
          </Button>
          <Button variant='outline-danger' onClick={handleLogout}>
            <FaSignOutAlt className='me-2' />
            Logout
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .profile-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .profile-container::before {
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

        .profile-container > * {
          position: relative;
          z-index: 2;
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

        /* Header Section */
        .profile-header {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(0, 191, 255, 0.2);
          padding: 2rem 0;
          margin-bottom: 2rem;
        }

        .header-content {
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(45deg, #00bfff, #00ff99);
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

        /* Profile Cards */
        .profile-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .profile-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .profile-card:hover::before {
          left: 100%;
        }

        .profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 191, 255, 0.2);
          border-color: rgba(0, 191, 255, 0.4);
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid rgba(0, 191, 255, 0.3);
          transition: all 0.3s ease;
        }

        .profile-avatar:hover {
          border-color: rgba(0, 191, 255, 0.6);
          transform: scale(1.05);
        }

        .qr-code {
          width: 100%;
          max-width: 150px;
          height: auto;
          border-radius: 10px;
          border: 2px solid rgba(0, 191, 255, 0.3);
          transition: all 0.3s ease;
        }

        .qr-code:hover {
          border-color: rgba(0, 191, 255, 0.6);
          transform: scale(1.05);
        }

        /* Wallet Section */
        .wallet-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 153, 0.2);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s ease;
          height: 100%;
        }

        .wallet-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 255, 153, 0.15);
          border-color: rgba(0, 255, 153, 0.4);
        }

        .wallet-balance {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #00ff99, #00bfff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        /* Stats Cards */
        .stats-card {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          text-align: center;
        }

        .stats-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 191, 255, 0.15);
        }

        .stats-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #00bfff, #00ff99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stats-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stats-label {
          color: #cccccc;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Buttons */
        .action-btn {
          background: linear-gradient(45deg, #00bfff, #00ff99);
          border: none;
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
          color: #000;
          text-decoration: none;
        }

        .action-btn.secondary {
          background: linear-gradient(45deg, #666666, #888888);
        }

        .action-btn.danger {
          background: linear-gradient(45deg, #ff4d4d, #ff6b6b);
        }

        /* Modal Styling */
        .modal-content {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 191, 255, 0.2);
          // border-radius: 15px;
          color: #ffffff;
        }

        .modal-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-control, .form-select {
          background: rgba(26, 26, 26, 0.8);
          border: 2px solid rgba(0, 191, 255, 0.3);
          border-radius: 10px;
          color: #ffffff;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          color: #ffffff;
          border-color: #00bfff;
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
          background: rgba(26, 26, 26, 0.9);
        }
        .form-control::placeholder, .form-select::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .wallet-balance {
            font-size: 2rem;
          }

          .profile-card, .wallet-card {
            padding: 1.5rem;
          }

          .stats-card {
            padding: 1rem;
          }
        }

        @media (max-width: 576px) {
          .page-title {
            font-size: 1.5rem;
          }

          .wallet-balance {
            font-size: 1.5rem;
          }

          .profile-avatar {
            width: 100px;
            height: 100px;
          }
          .acc-btn {
            display: inline-block!important;
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

        /* Alert Styling */
        .alert {
          border-radius: 10px;
          border: none;
        }

        .alert-success {
          background: linear-gradient(45deg, rgba(0, 255, 153, 0.2), rgba(0, 191, 255, 0.2));
          color: #00ff99;
        }

        .alert-danger {
          background: linear-gradient(45deg, rgba(255, 77, 77, 0.2), rgba(255, 107, 107, 0.2));
          color: #ff4d4d;
        }

        .alert-warning {
          background: linear-gradient(45deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.2));
          color: #ffc107;
        }
      `}</style>

      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <h1 className="page-title floating">Your Profile</h1>
          <p className="text-light fs-3">
            Welcome <i>{user.name},</i>
          </p>
          <p className="text-light">Manage your Account and Wallet...</p>
        </div>
      </div>

      <Container fluid>
        {/* Alert */}
        {alert.show && (
          <Alert
            variant={alert.type}
            onClose={() => setAlert({ show: false, message: "", type: "" })}
            dismissible
            className="mb-4"
          >
            {alert.message}
          </Alert>
        )}

        <Row className="mb-4">
          {/* Profile Information */}
          <Col lg={8} className="mb-4">
            <div className="profile-card">
              <Row>
                <Col md={4} className="text-center mb-3">
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="profile-avatar mb-3"
                  />
                  <h4 className="mb-1">{user.name}</h4>
                  <p className="text-light mb-2">{user.email}</p>
                  <Badge bg="primary text-white fs-6" className="mb-2">
                    @{user.username}
                  </Badge>
                  <p className="mb-0">
                    <FaPhone className="me-2 text-primary" />
                    {user.mobile}
                  </p>
                  <p className="mb-0">
                    <FaCalendar className="me-2 text-primary" />
                    {user.date_joined}
                  </p>
                </Col>
                <Col md={8}>
                  <div>
                    <Row>
                      <Col md={6} className="text-center mb-3">
                        <h6 className="text-info mb-3">QR Code</h6>
                        <img
                          src={user.qr_code}
                          alt="QR Code"
                          className="qr-code mb-2"
                        />
                      </Col>
                      <Col md={6} className="text-center mb-3">
                        <h6 className="text-info mb-3">Account Status</h6>
                        <div className="d-flex flex-column gap-2 h-100 justify-content-start py-2">
                          <Badge bg="success text-dark" className="p-2">
                            <FaShieldAlt className="me-2" />
                            Verified
                          </Badge>
                          <Badge bg="info text-dark" className="p-2">
                            <FaStar className="me-2" />
                            Premium Member
                          </Badge>
                          <Badge bg="danger text-dark" className="p-2">
                            <FaBell className="me-2" />
                            Subscription On
                          </Badge>
                          <Badge bg="warning text-dark" className="p-2">
                            <FaTrophy className="me-2" />
                            Active Investor
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                    <div className="acc-btn mt-4 text-center d-flex justify-content-around">
                      <Button
                        className="action-btn me-2 m-2"
                        onClick={() => setShowEditModal(true)}
                      >
                        <FaEdit />
                        Edit Profile
                      </Button>
                      <Button
                        className="action-btn me-2 m-2"
                        onClick={() => (window.location.href = "/")}
                      >
                        <FaChartLine />
                        Dashboard
                      </Button>
                      <Button
                        className="action-btn m-2"
                        onClick={() => (window.location.href = "/Portfolio")}
                      >
                        <FaChartBar />
                        Portfolio
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>

          {/* Wallet Section */}
          <Col lg={4} className="mb-4">
            <div className="wallet-card">
              <div className="text-center mb-4">
                <FaWallet
                  className="mb-3"
                  style={{ fontSize: "3rem", color: "#00ff99" }}
                />
                <h5 className="text-primary mb-2">Digital Wallet</h5>
                <div className="wallet-balance">
                  ₹{parseFloat(user.balance || 0).toLocaleString("en-IN")}
                </div>
                <p className="text-light mb-3">Available Balance</p>
              </div>

              <div className="d-grid gap-2">
                <Button
                  className="action-btn"
                  onClick={() => {
                    setTransactionType("add");
                    setShowWalletModal(true);
                  }}
                >
                  <FaPlus />
                  Add Money
                </Button>
                <Button
                  className="action-btn danger"
                  onClick={() => {
                    setTransactionType("withdraw");
                    setShowWalletModal(true);
                  }}
                >
                  <FaMinus />
                  Withdraw
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Statistics Section */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <div className="stats-card">
              <div className="stats-icon">
                <FaChartLine />
              </div>
              <div className="stats-value">₹{portfolioData.totalInvestment.toLocaleString('en-IN')}</div>
              <div className="stats-label">Total Investments</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stats-card">
              <div className="stats-icon">
                <FaChartBar />
              </div>
              <div className="stats-value">₹{portfolioData.currentValue.toLocaleString('en-IN')}</div>
              <div className="stats-label">Current Value</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stats-card">
              <div className="stats-icon">
                <FaPercentage />
              </div>
              <div className={`stats-value ${portfolioData.totalReturnPercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {portfolioData.totalReturnPercent.toFixed(2)}%
              </div>
              <div className="stats-label">Total Returns</div>
            </div>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <div className="stats-card">
              <div className="stats-icon">
                <FaChartPie />
              </div>
              <div className="stats-value">{portfolioData.activeFunds}</div>
              <div className="stats-label">Active Funds</div>
            </div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <div className="profile-card">
              <h5 className="text-primary mb-3">
                <FaCog className="me-2" />
                Quick Actions
              </h5>
              <Row>
                <Col md={3} className="mb-2">
                  <Button className="action-btn w-100" variant="outline-light" onClick={handleDownloadStatement}>
                    <FaDownload className="me-2" />
                    Download Statement
                  </Button>
                </Col>              
                <Col md={3} className="mb-2">
                  <Button className="action-btn w-100" variant="outline-light"
                  onClick={() => (window.location.href = "/Register")}>
                    <FaUserPlus className="me-2" />
                    Create New Account
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button className="action-btn w-100" variant="outline-light"
                  onClick={() => (window.location.href = "https://wa.me/916359630820?text=From%20your%20FINANCOGRAM%20website.")}>
                    <FaWhatsapp className="me-2" />
                    Get In Touch
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button className="action-btn danger w-100" variant="outline-light"
                  onClick={() => setShowModal(true)}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </Col>
                {/* <Col md={3} className="mb-2">
                  <Button className="action-btn w-100" variant="outline-light">
                    <FaUpload className="me-2" />
                    Upload Documents
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button className="action-btn w-100" variant="outline-light">
                    <FaBell className="me-2" />
                    Notifications
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button className="action-btn w-100" variant="outline-light">
                    <FaShieldAlt className="me-2" />
                    Security Settings
                  </Button>
                </Col> */}
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

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

      {/* Wallet Modal */}
      <Modal
        show={showWalletModal}
        onHide={() => setShowWalletModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaWallet className="me-2" />
            {transactionType === "add" ? "Add Money" : "Withdraw Money"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select>
                <option>UPI</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Net Banking</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWalletModal(false)}>
            Cancel
          </Button>
          <Button className="action-btn" onClick={handleWalletTransaction}>
            {transactionType === "add" ? "Add Money" : "Withdraw"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.username}
                    disabled
                    className="text-muted"
                    style={{ cursor: "not-allowed" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user.email}
                    disabled
                    className="text-muted"
                    style={{ cursor: "not-allowed" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={user.mobile}
                    disabled
                    className="text-muted"
                    style={{ cursor: "not-allowed" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && (
                <img
                  src={preview}
                  height="100"
                  width="100"
                  alt="Preview"
                  className="mt-2"
                />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button className="action-btn" onClick={handleEditProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile
