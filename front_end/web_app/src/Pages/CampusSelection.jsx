import React, { useState, useEffect } from 'react';
import './css/style.css';
import { useNavigate } from 'react-router-dom';


const CampusSelection = () => {
  const navigate = useNavigate();
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const campuses = [
    {
      id: 'apk', name: 'APK', location: 'Auckland Park kingsway', nurses: 3,
      icon: 'fa-building-columns', badge: 'recommended', badgeText: 'Most Staffed'
    },
    {
      id: 'dfc', name: 'DFC', location: 'Doornfontein', nurses: 2,
      icon: 'fa-hospital', badge: 'standard', badgeText: 'Standard'
    },
    {
      id: 'apb', name: 'APB', location: 'Auckland Park Bunting', nurses: 2,
      icon: 'fa-stethoscope', badge: 'standard', badgeText: 'Standard'
    },
    {
      id: 'swc', name: 'SWC', location: 'Soweto', nurses: 2,
      icon: 'fa-house-medical', badge: 'standard', badgeText: 'Standard'
    }
  ];

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2500);
  };

  const selectCampus = (campus) => {
    setSelectedCampus(campus.id);
    showToast(`${campus.name} — ${campus.location} selected`);
  };

  const continueToNext = () => {
    if (!selectedCampus || isLoading) return;
    setIsLoading(true);
    
    // Simulate API call / navigation delay
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/calendarselection?campus=${selectedCampus}`);
      // In a real app: navigate('/calendar', { state: { campus: selectedCampus } })
    }, 1500);
  };

  const handleMouseMove = (e, cardId) => {
    if (selectedCampus !== cardId) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <>
      {/* Ambient Background */}
      <div className="ambient">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="topbar">
        <div className="topbar-left">
          <div className="logo-mark"><i className="fa-solid fa-shield-heart"></i></div>
          <span className="logo-text">C-SHAW</span>
        </div>
        <div className="topbar-right">
          <div className="step-indicator">
            <span className="step active">1</span>
            <span className="step-line"></span>
            <span className="step">2</span>
            <span className="step-line"></span>
            <span className="step">3</span>
            <span className="step-line"></span>
            <span className="step">4</span>
          </div>
          <div className="avatar"><i className="fa-solid fa-user"></i></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        <div className="page-header">
          <p className="eyebrow">Step 1 of 4</p>
          <h1 className="page-title">Choose Your Campus</h1>
          <p className="page-subtitle">Select the campus clinic where you'd like to book your appointment. Nurse availability varies per campus.</p>
        </div>

        <div className="campus-grid">
          {campuses.map((campus) => (
            <div
              key={campus.id}
              className={`campus-card ${selectedCampus === campus.id ? 'selected' : ''}`}
              onClick={() => selectCampus(campus)}
              onMouseMove={(e) => handleMouseMove(e, campus.id)}
              style={{
                '--mx': selectedCampus === campus.id ? '50%' : `${mousePos.x}px`,
                '--my': selectedCampus === campus.id ? '50%' : `${mousePos.y}px`
              }}
              tabIndex="0"
              role="button"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCampus(campus); }}}
            >
              <div className="card-glow"></div>
              <div className="card-top">
                <div className="campus-icon"><i className={`fa-solid ${campus.icon}`}></i></div>
                <div className={`campus-badge ${campus.badge}`}>{campus.badgeText}</div>
              </div>
              <div className="card-body">
                <h2 className="campus-name">{campus.name}</h2>
                <p className="campus-location"><i className="fa-solid fa-location-dot"></i> {campus.location}</p>
                <div className="divider"></div>
                <div className="nurse-info">
                  <div className="nurse-avatars">
                    {Array.from({ length: campus.nurses }).map((_, i) => (
                      <div key={i} className="nurse-dot"><i className="fa-solid fa-user-nurse"></i></div>
                    ))}
                  </div>
                  <div className="nurse-text">
                    <span className="nurse-count">{campus.nurses} Nurse{campus.nurses > 1 ? 's' : ''}</span>
                    <span className="nurse-label">Available daily</span>
                  </div>
                </div>
              </div>
              <div className="card-action">
                <span className="select-label">Select Campus</span>
                <div className="select-arrow"><i className="fa-solid fa-arrow-right"></i></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bottom-info">
          <div className="info-chip">
            <i className="fa-solid fa-circle-info"></i>
            <span>Appointments are campus-specific. Choose carefully — you cannot change campus after booking.</span>
          </div>
        </div>

        <div className="cta-wrapper">
          <button 
            className="cta-btn" 
            disabled={!selectedCampus || isLoading} 
            onClick={continueToNext}
          >
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i><span>Loading...</span></>
            ) : (
              <><span>Continue to Calendar</span><i className="fa-solid fa-arrow-right"></i></>
            )}
          </button>
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <i className="fa-solid fa-check-circle"></i>
        <span>{toast.msg}</span>
      </div>
    </>
  );
};

export default CampusSelection;