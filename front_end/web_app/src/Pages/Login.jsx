import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login-style.css';

const Login = () => {
  const navigate = useNavigate();
  const [studentNum, setStudentNum] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentNum) {
      setError('Please enter your student or staff number.');
      return;
    }
    if (password.length < 3) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send Login Request to the Backend
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNum, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // 2. Save User Data to LocalStorage
      localStorage.setItem('cshaw_user', JSON.stringify(data.user));

      // --- DEBUGGING: Check the console to see what role is returned ---
      console.log("Logged in user role is:", data.user.role);

      // 3. Navigate based on actual DB roles
      const staffRoles = ['clerk', 'nurse', 'doctor'];
      
      // Check if the user's role is inside the staffRoles array
      if (staffRoles.includes(data.user.role)) {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard'); // Regular student dashboard
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Ambient Background Blobs */}
      <div className="ambient">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-container">
        {/* Left Side: Branding */}
        <div className="login-branding">
          <div className="brand-badge">
            <i className="fa-solid fa-shield-heart"></i>
            <span>C-SHAW</span>
          </div>
          <h1 className="brand-title">
           Center for Student Health and Wellness <br />
          </h1>
          <p className="brand-desc">
            Smart, fast, and secure way to book your campus clinic appointments. 
            Managed by the University of Johannesburg Health Services.
          </p>
          
          <div className="brand-stats">
            <div className="b-stat">
              <span className="b-stat-val">4</span>
              <span className="b-stat-label">Campuses</span>
            </div>
            <div className="b-stat-divider"></div>
            <div className="b-stat">
              <span className="b-stat-val">10+</span>
              <span className="b-stat-label">Nurses</span>
            </div>
            <div className="b-stat-divider"></div>
            <div className="b-stat">
              <span className="b-stat-val">8-17H</span>
              <span className="b-stat-label">Access</span>
            </div>
          </div>

          <div className="brand-footer">
            <p>&copy; 2026 University of Johannesburg</p>
            <p>All rights reserved.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-card">
            {/* Mobile-only Logo */}
            <div className="mobile-logo">
              <i className="fa-solid fa-shield-heart"></i>
              <span>C-SHAW</span>
            </div>

            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Student Number Field */}
            {/* Student / Staff Number Field */}
              <div className="input-group">
                <label htmlFor="studentNum">Student / Staff Number</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-id-card input-icon"></i>
                  <input
                    id="studentNum"
                    type="text"
                    inputMode="text"
                    placeholder="e.g. 218123456 or STF001"
                    maxLength={20}
                    value={studentNum}
                    onChange={(e) => setStudentNum(e.target.value.toUpperCase())} // Removed the \D restriction and made it uppercase
                    className={error.includes('student') || error.includes('valid') ? 'input-error' : ''}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your UJ password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={error.includes('Password') ? 'input-error' : ''}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    className="toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-msg">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Help Links */}
            <div className="help-links">
              <a href="#" onClick={(e) => e.preventDefault()}>UJ IT Helpdesk</a>
            </div>

            {/* Security Notice */}
             {/* Security Notice */}
            <div className="security-notice" style={{ marginBottom: '24px' }}>
              <i className="fa-solid fa-shield-halved"></i>
              <p>NB: Ulink Credentials required for login.</p>
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;