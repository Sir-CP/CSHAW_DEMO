// --- NEW FILE: WalkInConfirmation.jsx ---

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './css/confirmation-style.css';

const WalkInConfirmation = () => {
  const [searchParams] = useSearchParams();

  const pCampus = searchParams.get('campus') || 'apk';
  const pService = searchParams.get('service') || 'general';
  const queueNum = searchParams.get('queue') || 'Q-00';
  
  const isEmergency = queueNum.startsWith('E');

  const campusNames = {
    apk: 'APK Clinic', dfc: 'DFC Clinic',
    apb: 'APB Clinic', swc: 'SWC Clinic'
  };

  const serviceNames = {
    emergency: 'Medical Emergency',
    hiv: 'HIV Testing',
    family: 'Family Planning',
    general: 'General Walk-in'
  };

  return (
    <>
      <div className="ambient">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <nav className="topbar">
        <div className="topbar-left">
          <div className="logo-mark"><i className="fa-solid fa-shield-heart"></i></div>
          <span className="logo-text">C-SHAW</span>
        </div>
      </nav>

      <main className="main">
        <div className="success-banner">
          <div className="success-icon-wrap">
            <div className="success-ring" style={isEmergency ? { borderColor: 'var(--red-flag)' } : {}}></div>
            <div className="success-icon" style={isEmergency ? { background: 'var(--red-bg)', borderColor: 'var(--red-flag)', color: 'var(--red-flag)' } : {}}>
              <i className={`fa-solid ${isEmergency ? 'fa-truck-medical' : 'fa-check'}`}></i>
            </div>
          </div>
          <h1 className="success-title">Check-In Successful</h1>
          <p className="success-ref">You have been added to the live queue at <strong>{campusNames[pCampus]}</strong>.</p>
        </div>

        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          
          {/* Huge Queue Number Card */}
          <div className="stat-card" style={{ textAlign: 'center', padding: '40px 20px', border: `2px solid ${isEmergency ? 'var(--red-flag)' : 'var(--orange-primary)'}` }}>
            <div className="stat-label">Your Queue Number</div>
            <div className="stat-number" style={{ fontSize: '72px', margin: '10px 0', color: isEmergency ? 'var(--red-flag)' : 'var(--orange-primary)' }}>
              {queueNum}
            </div>
            <div className="service-tag" style={{ marginTop: '10px' }}>
              {serviceNames[pService]}
            </div>
          </div>

          {/* Instructions Card */}
          <div className="info-card">
            <div className="info-card-label"><i className="fa-solid fa-circle-info"></i> What to do next</div>
            <ul className="bring-list">
              {isEmergency ? (
                <>
                  <li style={{ color: 'var(--red-flag)' }}><i className="fa-solid fa-triangle-exclamation"></i> Proceed immediately to the triage desk.</li>
                  <li><i className="fa-solid fa-id-card"></i> Have your student ID ready.</li>
                </>
              ) : (
                <>
                  <li><i className="fa-solid fa-chair"></i> Please take a seat in the waiting area.</li>
                  <li><i className="fa-solid fa-tv"></i> Watch the screens for your queue number.</li>
                  <li><i className="fa-solid fa-id-card"></i> Have your student ID ready for the nurse.</li>
                </>
              )}
            </ul>
          </div>

          <Link to="/staff-dashboard" className="action-btn dashboard" style={{ marginTop: '20px' }}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Return to Dashboard</span>
          </Link>

        </div>
      </main>
    </>
  );
};

export default WalkInConfirmation;