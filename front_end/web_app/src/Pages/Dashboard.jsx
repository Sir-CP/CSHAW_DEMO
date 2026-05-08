import React, { useState } from 'react';
import './css/landingpage_style.css';
import './css/theme.css'

import { Link } from 'react-router-dom';


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  // --- Sidebar & Panel Handlers ---
  const openSidebar = () => {
    setSidebarOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = '';
    setActivePanel(null); // Reset panel when sidebar closes
  };

  const openProfileSection = (section) => setActivePanel(section);
  
  const closeProfilePanel = () => setActivePanel(null);

  // --- History & Toast Handlers ---
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', icon: '' });

// --- User Data Logic ---
  const [userData, setUserData] = React.useState({ firstName: 'Student', lastName: '', studentNumber: '' });

  React.useEffect(() => {
    const storedUser = localStorage.getItem('cshaw_user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  
  },[]);

  const showToast = (msg, icon = 'fa-circle-check') => {
    setToast({ show: true, msg, icon });
    setTimeout(() => setToast({ show: false, msg: '', icon: '' }), 2800);
  };

  // --- Keyboard handler for Escape key ---
  React.useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeSidebar(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // --- Render Helpers ---
  const renderPanelContent = () => {
    if (!activePanel) return null;

    const panels = {
      personal: (
        <div className="panel-content">
          <h3 className="panel-title">Edit Personal Information</h3>
          <div className="panel-form">
            <div className="panel-field"><label>First Name</label><input type="text" defaultValue="Thabo" className="panel-input" /></div>
            <div className="panel-field"><label>Last Name</label><input type="text" defaultValue="Molefe" className="panel-input" /></div>
            <div className="panel-field"><label>Email Address</label><input type="email" defaultValue="tmolefe@student.uj.ac.za" className="panel-input" /></div>
            <div className="panel-field"><label>Phone Number</label><input type="tel" defaultValue="071 234 5678" className="panel-input" /></div>
            <div className="panel-field">
              <label>Gender</label>
              <select className="panel-input"><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select>
            </div>
            <button className="panel-save" onClick={() => { showToast('Personal info updated'); closeProfilePanel(); }}><i className="fa-solid fa-check"></i> Save Changes</button>
          </div>
        </div>
      ),
      emergency: (
        <div className="panel-content">
          <h3 className="panel-title">Emergency Contacts</h3>
          <p className="panel-desc">These contacts will be notified in case of a medical emergency during your visit.</p>
          
          <div className="emergency-card">
            <div className="ec-header"><span className="ec-label">Primary Contact</span><button className="ec-remove" onClick={() => showToast('Contact removed', 'fa-trash')}><i className="fa-solid fa-trash"></i></button></div>
            <div className="panel-field"><label>Full Name</label><input type="text" defaultValue="Mmapula Molefe" className="panel-input" /></div>
            <div className="panel-field"><label>Relationship</label><select className="panel-input"><option selected>Mother</option><option>Father</option><option>Sibling</option></select></div>
            <div className="panel-field"><label>Phone Number</label><input type="tel" defaultValue="082 987 6543" className="panel-input" /></div>
          </div>

          <button className="panel-add" onClick={() => showToast('Added secondary contact', 'fa-plus')}><i className="fa-solid fa-plus"></i> Add Another Contact</button>
          <button className="panel-save" onClick={() => { showToast('Emergency contacts updated'); closeProfilePanel(); }}><i className="fa-solid fa-check"></i> Save Contacts</button>
        </div>
      ),
      medical: (
        <div className="panel-content">
          <h3 className="panel-title">Medical Information</h3>
          <p className="panel-desc">This information helps our clinic staff provide better care. All data is kept confidential.</p>
          <div className="panel-form">
            <div className="panel-field"><label>Known Allergies</label><textarea className="panel-textarea" rows="2" defaultValue="None known" /></div>
            <div className="panel-field"><label>Chronic Conditions</label><textarea className="panel-textarea" rows="2" defaultValue="None" /></div>
            <div className="panel-field"><label>Current Medications</label><textarea className="panel-textarea" rows="2" defaultValue="None" /></div>
            <div className="panel-field"><label>Blood Type</label><select className="panel-input"><option>Unknown</option><option>A+</option><option selected>B+</option><option>O+</option></select></div>
            <button className="panel-save" onClick={() => { showToast('Medical info updated'); closeProfilePanel(); }}><i className="fa-solid fa-check"></i> Save Information</button>
          </div>
        </div>
      ),
      password: (
        <div className="panel-content">
          <h3 className="panel-title">Change Password</h3>
          <div className="panel-form">
            <div className="panel-field"><label>Current Password</label><input type="password" placeholder="Enter current password" className="panel-input" /></div>
            <div className="panel-field"><label>New Password</label><input type="password" placeholder="Enter new password" className="panel-input" /></div>
            <div className="panel-field"><label>Confirm New Password</label><input type="password" placeholder="Re-enter new password" className="panel-input" /></div>
            <button className="panel-save" onClick={() => { showToast('Password changed successfully'); closeProfilePanel(); }}><i className="fa-solid fa-check"></i> Update Password</button>
          </div>
        </div>
      )
    };

    return panels[activePanel];
  };

  return (
    <>
      {/* Ambient Background */}
      <div className="ambient"><div className="blob blob-1"></div><div className="blob blob-2"></div><div className="blob blob-3"></div></div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="sidebar-avatar"><span>TM</span></div>
            <div className="sidebar-user-info"><h3 className="sidebar-username">Thabo Molefe</h3><p className="sidebar-studnum">218123456</p></div>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar"><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        {!activePanel ? (
          <>
            <div className="sidebar-divider"></div>
            <div className="sidebar-section">
              <p className="sidebar-section-label">Profile</p>
              <button className="sidebar-item" onClick={() => openProfileSection('personal')}><i className="fa-solid fa-user-pen"></i><span>Edit Personal Info</span><i className="fa-solid fa-chevron-right"></i></button>
              <button className="sidebar-item" onClick={() => openProfileSection('emergency')}><i className="fa-solid fa-phone-volume"></i><span>Emergency Contacts</span><i className="fa-solid fa-chevron-right"></i></button>
              <button className="sidebar-item" onClick={() => openProfileSection('medical')}><i className="fa-solid fa-file-medical"></i><span>Medical Information</span><i className="fa-solid fa-chevron-right"></i></button>
              <button className="sidebar-item" onClick={() => openProfileSection('password')}><i className="fa-solid fa-lock"></i><span>Change Password</span><i className="fa-solid fa-chevron-right"></i></button>
            </div>
            <div className="sidebar-divider"></div>
            <div className="sidebar-section">
              <p className="sidebar-section-label">Support</p>
              <button className="sidebar-item" onClick={() => showToast('Opening help centre...', 'fa-circle-question')}><i className="fa-solid fa-circle-question"></i><span>Help Centre</span><i className="fa-solid fa-chevron-right"></i></button>
            </div>
            <div className="sidebar-divider"></div>
            <div className="sidebar-section"><button className="sidebar-item signout" onClick={() => showToast('Signing out...', 'fa-right-from-bracket')}><i className="fa-solid fa-right-from-bracket"></i><span>Sign Out</span></button></div>
            <div className="sidebar-footer"><p>C-SHAW v1.0</p><p>University of Johannesburg</p></div>
          </>
        ) : (
          <div className={`profile-panel ${activePanel ? 'open' : ''}`}>
            <button className="panel-back" onClick={closeProfilePanel}><i className="fa-solid fa-arrow-left"></i><span>Back</span></button>
            {renderPanelContent()}
          </div>
        )}
      </aside>

      {/* Top Navigation Bar */}
      <nav className="topbar">
        <div className="topbar-left">
          <div className="logo-mark"><i className="fa-solid fa-shield-heart"></i></div>
          <span className="logo-text">C-SHAW</span>
        </div>
        <div className="topbar-right">
          <div className="topbar-greeting"><span className="greeting-text">Welcome back,</span><span className="greeting-name">Thabo</span></div>
          <button className="hamburger" onClick={openSidebar} aria-label="Open menu"><span></span><span></span><span></span></button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        <div className="quick-actions">
          <Link to="/campusselection" className="action-card primary-action">
            <div className="action-card-glow"></div>
            <div className="action-icon-lg"><i className="fa-solid fa-calendar-plus"></i></div>
            <div className="action-card-body"><h2 className="action-title">Book Appointment</h2><p className="action-desc">Select your campus, choose a date and time, and complete the screening questionnaire.</p></div>
            <div className="action-arrow"><i className="fa-solid fa-arrow-right"></i></div>
          </Link>
          <button className="action-card secondary-action" onClick={() => { setShowHistory(true); setTimeout(() => document.getElementById('historySection')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
            <div className="action-icon-lg secondary"><i className="fa-solid fa-clock-rotate-left"></i></div>
            <div className="action-card-body"><h2 className="action-title">Consultation History</h2><p className="action-desc">View your past clinic visits, prescribed medications.</p></div>
            <div className="action-arrow secondary"><i className="fa-solid fa-arrow-right"></i></div>
          </button>


        </div>

        <div className="stats-row">
          <div className="stat-tile"><div className="stat-tile-icon orange"><i className="fa-solid fa-chart-line"></i></div><div className="stat-tile-info"><span className="stat-tile-val">4.2</span><span className="stat-tile-label">Avg Monthly Visits</span></div></div>
          <div className="stat-tile"><div className="stat-tile-icon green"><i className="fa-solid fa-calendar-check"></i></div><div className="stat-tile-info"><span className="stat-tile-val">23</span><span className="stat-tile-label">Total Consultations</span></div></div>
          <div className="stat-tile"><div className="stat-tile-icon blue"><i className="fa-solid fa-clipboard-list"></i></div><div className="stat-tile-info"><span className="stat-tile-val">1</span><span className="stat-tile-label">Active Booking</span></div></div>
        </div>

        <div className="section-header"><h3 className="section-title"><i className="fa-solid fa-bell"></i>Upcoming Appointment</h3></div>
        <div className="upcoming-card" onClick={() => showToast('Loading booking details...', 'fa-calendar-check')}>
          <div className="upcoming-left"><div className="upcoming-date-block"><span className="upcoming-day">THU</span><span className="upcoming-num">17</span><span className="upcoming-month">JUL</span></div></div>
          <div className="upcoming-divider"></div>
          <div className="upcoming-center"><div className="upcoming-meta"><span className="upcoming-campus"><i className="fa-solid fa-location-dot"></i> APK Clinic</span><span className="upcoming-time"><i className="fa-regular fa-clock"></i> 09:15 — 09:30</span><span className="upcoming-service"><i className="fa-solid fa-stethoscope"></i> General Consultation</span></div></div>
          <div className="upcoming-right"><div className="upcoming-nurse"><i className="fa-solid fa-user-nurse"></i><span>Nurse P. Mokoena</span></div><div className="upcoming-flag"><i className="fa-solid fa-flag"></i><span>Triage Flag</span></div></div>
        </div>

        {showHistory && (
          <div className="history-section" id="historySection">
            <div className="section-header"><h3 className="section-title"><i className="fa-solid fa-clock-rotate-left"></i>Consultation History</h3><button className="section-close" onClick={() => setShowHistory(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="history-list">
              <div className="history-card"><div className="history-date-col"><span className="hist-day">WED</span><span className="hist-num">02</span><span className="hist-month">JUL</span></div><div className="history-body"><div className="history-top"><h4 className="hist-service">STI Screening</h4><span className="hist-status completed">Completed</span></div><p className="hist-detail"><i className="fa-solid fa-location-dot"></i> APK Clinic · <i className="fa-regular fa-clock"></i> 10:00</p><p className="hist-nurse"><i className="fa-solid fa-user-nurse"></i> Nurse J. Dlamini</p></div></div>
              <div className="history-card"><div className="history-date-col"><span className="hist-day">MON</span><span className="hist-num">16</span><span className="hist-month">JUN</span></div><div className="history-body"><div className="history-top"><h4 className="hist-service">General Consultation</h4><span className="hist-status completed">Completed</span></div><p className="hist-detail"><i className="fa-solid fa-location-dot"></i> APK Clinic · <i className="fa-regular fa-clock"></i> 08:30</p><p className="hist-nurse"><i className="fa-solid fa-user-nurse"></i> Nurse P. Mokoena</p></div></div>
              <div className="history-card"><div className="history-date-col"><span className="hist-day">FRI</span><span className="hist-num">16</span><span className="hist-month">MAY</span></div><div className="history-body"><div className="history-top"><h4 className="hist-service">HIV Testing</h4><span className="hist-status completed">Completed</span></div><p className="hist-detail"><i className="fa-solid fa-location-dot"></i> DFC Clinic · <i className="fa-regular fa-clock"></i> 11:15</p><p className="hist-nurse"><i className="fa-solid fa-user-nurse"></i> Nurse R. van Wyk</p></div></div>
              <div className="history-card"><div className="history-date-col"><span className="hist-day">THU</span><span className="hist-num">01</span><span className="hist-month">MAY</span></div><div className="history-body"><div className="history-top"><h4 className="hist-service">General Consultation</h4><span className="hist-status no-show">No Show</span></div><p className="hist-detail"><i className="fa-solid fa-location-dot"></i> APK Clinic · <i className="fa-regular fa-clock"></i> 09:00</p><p className="hist-nurse"><i className="fa-solid fa-user-nurse"></i> Nurse P. Mokoena</p></div></div>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <i className={`fa-solid ${toast.icon}`}></i>
        <span>{toast.msg}</span>
      </div>
    </>
  );
};

export default Dashboard;