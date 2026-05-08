import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './css/screening-style.css'; 

const WalkIn = () => {
  const navigate = useNavigate();

  // --- State ---
  const [userType, setUserType] = useState('student'); // 'student', 'staff', 'visitor'
  const [identityNumber, setIdentityNumber] = useState('');
  const[fullName, setFullName] = useState('');
  
  // Default to APK, but we check if the clerk was already viewing a specific campus
  const [selectedCampus, setSelectedCampus] = useState('apk');
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const services =[
    { id: 'emergency', icon: 'fa-truck-medical', label: 'Medical Emergency', isUrgent: true },
    { id: 'hiv', icon: 'fa-microscope', label: 'HIV Testing', isUrgent: false },
    { id: 'family', icon: 'fa-baby', label: 'Family Planning', isUrgent: false },
    { id: 'general', icon: 'fa-stethoscope', label: 'General Walk-in', isUrgent: false }
  ];

  let identityLabel = 'Student Number';
  let identityPlaceholder = 'e.g. 218123456';
  let identityMaxLength = 9;

  if (userType === 'staff') {
    identityLabel = 'Staff Number';
    identityPlaceholder = 'e.g. STF001';
    identityMaxLength = 10;
  } else if (userType === 'visitor') {
    identityLabel = 'ID or Passport Number';
    identityPlaceholder = 'Enter patient ID number';
    identityMaxLength = 13;
  }

  let isIdentityValid = false;
  if (userType === 'student') {
    isIdentityValid = /^\d{9}$/.test(identityNumber);
  } else {
    isIdentityValid = identityNumber.length >= 4; 
  }
  
  const isFormValid = isIdentityValid && fullName.length > 2 && selectedService !== null;

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setIdentityNumber(''); 
  };

  const handleCheckIn = async () => {
    if (!isFormValid || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,        
          identityNumber,  
          fullName,
          campus: selectedCampus,
          service: selectedService
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      const params = new URLSearchParams({
        campus: selectedCampus,
        service: selectedService,
        queue: data.queueNumber   
      });

      // Route to confirmation page to tell the patient their number
      navigate(`/walkin-confirmation?${params.toString()}`);

    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="ambient">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <nav className="topbar">
        <div className="topbar-left">
          <div className="logo-mark"><i className="fa-solid fa-clipboard-user"></i></div>
          <span className="logo-text">C-SHAW <span style={{ color: 'var(--text-muted)' }}>| Clerk Portal</span></span>
        </div>
        <Link to="/staff-dashboard" className="cta-btn secondary" style={{ padding: '8px 16px' }}>
          Cancel
        </Link>
      </nav>

      <main className="main">
        <div className="page-header">
          <p className="eyebrow" style={{ background: 'var(--orange-soft)', color: 'var(--orange-primary)' }}>Front Desk Action</p>
          <h1 className="page-title">Register Walk-In Patient</h1>
          <p className="page-subtitle">Register a patient who is physically present at the clinic to assign them a live queue number.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="section-divider"><span>Patient Profile</span></div>

          <section className="form-section">
            <label className="field-label">Patient Type</label>
            <div className="service-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <button
                type="button"
                className={`service-chip ${userType === 'student' ? 'selected' : ''}`}
                onClick={() => handleUserTypeChange('student')}
              >
                <i className="fa-solid fa-user-graduate"></i><span>Student</span>
              </button>
              <button
                type="button"
                className={`service-chip ${userType === 'staff' ? 'selected' : ''}`}
                onClick={() => handleUserTypeChange('staff')}
              >
                <i className="fa-solid fa-user-tie"></i><span>Staff</span>
              </button>
              <button
                type="button"
                className={`service-chip ${userType === 'visitor' ? 'selected' : ''}`}
                onClick={() => handleUserTypeChange('visitor')}
              >
                <i className="fa-solid fa-users"></i><span>Visitor</span>
              </button>
            </div>
          </section>

          <section className="form-section">
            <label className="field-label">{identityLabel}</label>
            <div className="input-wrapper">
              <input
                type="text"
                className={`text-input ${identityNumber.length > 0 && !isIdentityValid ? 'invalid' : identityNumber.length > 0 ? 'valid' : ''}`}
                placeholder={identityPlaceholder}
                maxLength={identityMaxLength}
                value={identityNumber}
                onChange={(e) => {
                  if(userType === 'student') {
                    setIdentityNumber(e.target.value.replace(/\D/g, ''));
                  } else {
                    setIdentityNumber(e.target.value);
                  }
                }}
              />
            </div>
          </section>

          <section className="form-section">
            <label className="field-label">Patient Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="text-input"
                placeholder="Enter patient's full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <label className="field-label">Clinic Location</label>
            <select 
              className="text-input" 
              value={selectedCampus} 
              onChange={(e) => setSelectedCampus(e.target.value)}
            >
              <option value="apk">APK Clinic</option>
              <option value="dfc">DFC Clinic</option>
              <option value="apb">APB Clinic</option>
              <option value="swc">SWC Clinic</option>
            </select>
          </section>

          <div className="section-divider"><span>Triage / Service Required</span></div>

          <section className="form-section">
            <div className="service-grid">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  className={`service-chip ${selectedService === svc.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(svc.id)}
                  style={svc.isUrgent && selectedService === svc.id ? { background: 'var(--red-bg)', borderColor: 'var(--red-flag)', color: 'var(--red-flag)' } : {}}
                >
                  <i className={`fa-solid ${svc.icon}`} style={svc.isUrgent ? { color: 'var(--red-flag)' } : {}}></i>
                  <span>{svc.label}</span>
                </button>
              ))}
            </div>
          </section>

          {selectedService === 'emergency' && (
             <div className="covid-notice" style={{ background: 'var(--red-bg)', borderColor: 'var(--red-border)' }}>
               <div className="covid-notice-icon" style={{ color: 'var(--red-flag)' }}><i className="fa-solid fa-triangle-exclamation"></i></div>
               <p style={{ color: 'var(--text-primary)' }}><strong>Priority Alert:</strong> This will bypass the standard queue and alert the nurses immediately. Escort patient to triage.</p>
             </div>
          )}

          <div className="cta-row" style={{ marginTop: '40px' }}>
            <button
              type="button"
              className="cta-btn primary"
              disabled={!isFormValid || isLoading}
              onClick={handleCheckIn}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i><span>Generating Ticket...</span></>
              ) : (
                <><span>Generate Queue Ticket</span><i className="fa-solid fa-print"></i></>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default WalkIn;