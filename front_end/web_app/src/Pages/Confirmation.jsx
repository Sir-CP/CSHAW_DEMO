import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './css/confirmation-style.css';

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- Extract URL Params from Screening Page ---
  const pCampus = searchParams.get('campus') || 'apk';
  const pDate = searchParams.get('date') || '';
  const pTime = searchParams.get('time') || '';
  const pStudent = searchParams.get('student') || '';
  const pService = searchParams.get('service') || 'general';
  const pRedFlags = searchParams.get('redflags') === '1';
  const pRequests = searchParams.get('requests') || '';
  const pInfo = searchParams.get('info') || '';

  const q1 = searchParams.get('q1') || '';
  const q2 = searchParams.get('q2') || '';
  const q3 = searchParams.get('q3') || '';
  const q4 = searchParams.get('q4') || '';
  const q5 = searchParams.get('q5') || '';
  const q6 = searchParams.get('q6') || '';
  const allAnswers = { q1, q2, q3, q4, q5, q6 };

  // --- Reference Data ---
  const highRiskIds = ['q2', 'q4', 'q5', 'q6'];

  const campusNames = {
    apk: 'APK — Auckland Park', dfc: 'DFC — Doornfontein',
    apb: 'APB — Auckland Park B', swc: 'SWC — Soweto Campus'
  };

  const serviceNames = {
    general: 'General Consultation', sti: 'STI Screening', hiv: 'HIV Testing',
    tb: 'TB Screening', family: 'Family Planning', mental: 'Mental Health',
    contraception: 'Contraception', other: 'Other'
  };

  const nurseData = {
    apk: { name: 'Nurse P. Mokoena', qual: 'Primary Health Care | 8 yrs experience', clinic: 'APK Clinic' },
    dfc: { name: 'Nurse S. Dlamini', qual: 'Family Health | 6 yrs experience', clinic: 'DFC Clinic' },
    apb: { name: 'Nurse T. Ndlovu', qual: 'Sexual Health | 10 yrs experience', clinic: 'APB Clinic' },
    swc: { name: 'Nurse L. Khumalo', qual: 'Primary Health Care | 5 yrs experience', clinic: 'SWC Clinic' }
  };

  const clinicLocations = {
    apk: { name: 'APK Health Clinic', addr: 'Johannesburg, Auckland Park<br>Corner of Kingsway & University Rd' },
    dfc: { name: 'DFC Health Clinic', addr: 'Johannesburg, Doornfontein<br>38 Siemert Road, Beit Street' },
    apb: { name: 'APB Health Clinic', addr: 'Johannesburg, Auckland Park B<br>15 Bunting Road' },
    swc: { name: 'SWC Health Clinic', addr: 'Johannesburg, Soweto<br>Phefeni East, Chris Hani Rd' }
  };

  const questionTexts = {
    q1: 'Sexually active without condom (3 months)',
    q2: 'Unusual discharge or genital sores (3 months)',
    q3: 'New or multiple sexual partners (3 months)',
    q4: 'Close contact with TB patient',
    q5: 'Cough lasting more than 2 weeks',
    q6: 'Fever, night sweats or weight loss (past month)'
  };

  // --- State ---
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', icon: '' });

  // --- Derived Static Data (Memoized so it doesn't recalculate on timer tick) ---
  const pageData = useMemo(() => {
    const refNumber = 'CSH-2025-' + String(Math.floor(Math.random() * 90000) + 10000);
    const nurse = nurseData[pCampus] || nurseData.apk;
    const loc = clinicLocations[pCampus] || clinicLocations.apk;

    const formatTime12 = (time24) => {
      if (!time24) return '';
      const parts = time24.split(':');
      let h = parseInt(parts[0]);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${h}:${m} ${ampm}`;
    };

    const addMinutes = (time24, mins) => {
      if (!time24) return '';
      const parts = time24.split(':');
      let totalMins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + mins;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const formatDateLong = (isoStr) => {
      if (!isoStr) return '';
      const d = new Date(isoStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Build screening summary
    let riskCount = 0;
    const screeningItems = Object.keys(questionTexts).map(qId => {
      const answer = allAnswers[qId];
      const isHighRisk = highRiskIds.includes(qId);
      const isYes = answer === 'yes';
      if (isYes && isHighRisk) riskCount++;
      
      return { id: qId, text: questionTexts[qId], answer, isYes, isHighRisk };
    });

    const combinedNotes = [pRequests, pInfo].filter(Boolean).join('\n');

    return {
      refNumber, nurse, loc, riskCount, screeningItems, combinedNotes,
      formattedDate: formatDateLong(pDate),
      formattedTime: `${formatTime12(pTime)} — ${formatTime12(addMinutes(pTime, 15))}`,
      formattedTimeShort: formatTime12(pTime),
      modalText: `This will cancel your booking <strong>${refNumber}</strong> with ${nurse.name} on ${formatDateLong(pDate)} at ${formatTime12(pTime)}.`
    };
  }, [pCampus, pDate, pTime, pStudent, pService, pRequests, pInfo, allAnswers]);

  // --- Timer & Lock Logic ---
  const CANCEL_LOCK_MINUTES = 15;
  const minsAway = remainingSeconds / 60;
  const isLocked = remainingSeconds <= 0 || minsAway < CANCEL_LOCK_MINUTES;

  useEffect(() => {
    if (!pDate || !pTime) return;

    const calcSeconds = () => {
      const parts = pTime.split(':');
      const appointDate = new Date(
        parseInt(pDate.substring(0, 4)),
        parseInt(pDate.substring(5, 7)) - 1,
        parseInt(pDate.substring(8, 10)),
        parseInt(parts[0]),
        parseInt(parts[1]),
        0
      );
      const diff = appointDate.getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setRemainingSeconds(calcSeconds()); // Set initial time

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pDate, pTime]);

  // --- Formatters for Timer Display ---
  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');

  // --- Handlers ---
  const showToast = (msg, icon = 'fa-circle-check') => {
    setToast({ show: true, msg, icon });
    setTimeout(() => setToast({ show: false, msg: '', icon: '' }), 3000);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    showToast(`Appointment ${pageData.refNumber} has been cancelled`);
  };

  const attemptReschedule = () => {
    if (isLocked) return;
    navigate(`/calendarselection?campus=${pCampus}`);
  };

  // Escape key listener
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowCancelModal(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Lock text calculation
  const lockText = `Cancellation locked — appointment is ${Math.ceil(minsAway)} minute${Math.ceil(minsAway) !== 1 ? 's' : ''} away`;

  return (
    <>
      <div className="ambient">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <nav className="topbar">
        <div className="topbar-left">
          <div className="logo-mark"><i className="fa-solid fa-shield-heart"></i></div>
          <span className="logo-text">C-SHAW</span>
        </div>
        <div className="topbar-right">
          <div className="step-indicator">
            <span className="step done"><i className="fa-solid fa-check"></i></span>
            <span className="step-line done"></span>
            <span className="step done"><i className="fa-solid fa-check"></i></span>
            <span className="step-line done"></span>
            <span className="step done"><i className="fa-solid fa-check"></i></span>
            <span className="step-line done"></span>
            <span className="step active">4</span>
          </div>
          <div className="avatar"><i className="fa-solid fa-user"></i></div>
        </div>
      </nav>

      <main className="main">
        <div className="success-banner">
          <div className="success-icon-wrap">
            <div className="success-ring"></div>
            <div className="success-icon"><i className="fa-solid fa-check"></i></div>
          </div>
          <h1 className="success-title">Booking Confirmed</h1>
          <p className="success-ref">Reference: <strong>{pageData.refNumber}</strong></p>
        </div>

        <div className="content-grid">
          {/* Left Column */}
          <div className="col-main">
            <div className="detail-card nurse-card">
              <div className="card-label"><i className="fa-solid fa-user-nurse"></i> Assigned Nurse</div>
              <div className="nurse-profile">
                <div className="nurse-avatar-lg"><i className="fa-solid fa-user-nurse"></i></div>
                <div className="nurse-info">
                  <h2 className="nurse-name">{pageData.nurse.name}</h2>
                  <p className="nurse-qual">{pageData.nurse.qual}</p>
                  <div className="nurse-campus-tag"><i className="fa-solid fa-location-dot"></i><span>{pageData.nurse.clinic}</span></div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-label"><i className="fa-solid fa-calendar-check"></i> Appointment Details</div>
              <div className="detail-rows">
                <div className="detail-row"><span className="detail-key">Campus</span><span className="detail-val">{campusNames[pCampus]}</span></div>
                <div className="detail-row"><span className="detail-key">Date</span><span className="detail-val">{pageData.formattedDate}</span></div>
                <div className="detail-row"><span className="detail-key">Time</span><span className="detail-val">{pageData.formattedTime}</span></div>
                <div className="detail-row"><span className="detail-key">Duration</span><span className="detail-val">15 minutes</span></div>
                <div className="detail-row"><span className="detail-key">Service</span><span className="detail-val"><span className="service-tag">{serviceNames[pService] || pService}</span></span></div>
                <div className="detail-row"><span className="detail-key">Student Number</span><span className="detail-val mono">{pStudent || '—'}</span></div>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-label"><i className="fa-solid fa-clipboard-list"></i> Screening Summary</div>
              <div className="screening-list">
                {pageData.screeningItems.map((item) => (
                  <div key={item.id} className={`screening-item ${item.isYes && item.isHighRisk ? 'flagged' : 'clear'}`}>
                    <span className={`si-icon ${item.isYes && item.isHighRisk ? 'flag' : ''}`}>
                      <i className={`fa-solid ${item.isYes && item.isHighRisk ? 'fa-flag' : item.isYes ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                    </span>
                    <span className="si-text">{item.text}</span>
                    <span className={`si-badge ${item.isYes ? 'yes' : 'no'}`}>{item.answer === 'yes' ? 'Yes' : 'No'}</span>
                  </div>
                ))}
              </div>
              {pageData.riskCount > 0 && (
                <div className="flag-notice">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{pageData.riskCount} high-risk symptom{pageData.riskCount > 1 ? 's' : ''} flagged — Nurse has been notified for priority triage.</span>
                </div>
              )}
            </div>

            {pageData.combinedNotes && (
              <div className="detail-card">
                <div className="card-label"><i className="fa-solid fa-comment-medical"></i> Additional Notes</div>
                <p className="notes-text">{pageData.combinedNotes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-side">
            <div className="stat-card">
              <div className="stat-label">Avg Monthly Consultations</div>
              <div className="stat-value-row"><span className="stat-number">4.2</span><span className="stat-unit">visits</span></div>
              <div className="stat-bar-wrap">
                <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '56%' }}></div></div>
                <div className="stat-bar-labels"><span>0</span><span>Campus avg: 3.8</span><span>8+</span></div>
              </div>
              <p className="stat-note">Based on your last 6 months of clinic visits</p>
            </div>

            <div className="countdown-card">
              <div className="countdown-label">Time Until Appointment</div>
              <div className="countdown-digits">
                <div className="cd-block"><span className="cd-num">{hours}</span><span className="cd-unit">hrs</span></div>
                <span className="cd-sep">:</span>
                <div className="cd-block"><span className="cd-num">{mins}</span><span className="cd-unit">min</span></div>
                <span className="cd-sep">:</span>
                <div className="cd-block"><span className="cd-num">{secs}</span><span className="cd-unit">sec</span></div>
              </div>
              <div className="countdown-sub">{remainingSeconds <= 0 ? 'Appointment time has passed' : 'Arrive 5 minutes early'}</div>
            </div>

            <div className="info-card">
              <div className="info-card-label"><i className="fa-solid fa-bag-shopping"></i> What to Bring</div>
              <ul className="bring-list">
                <li><i className="fa-solid fa-id-card"></i> Student ID Card</li>
                <li><i className="fa-solid fa-mobile-screen"></i> This confirmation (screenshot)</li>
                <li><i className="fa-solid fa-notes-medical"></i> Previous prescriptions (if any)</li>
              </ul>
            </div>

            <div className="info-card">
              <div className="info-card-label"><i className="fa-solid fa-map-pin"></i> Clinic Location</div>
              <div className="location-detail">
                <p className="loc-name">{pageData.loc.name}</p>
                <p className="loc-addr" dangerouslySetInnerHTML={{ __html: pageData.loc.addr }}></p>
                <span className="loc-hours"><i className="fa-regular fa-clock"></i> Mon–Fri: 07:30 – 17:00</span>
              </div>
            </div>

            <div className="action-stack">
              <button className={`action-btn cancel ${isLocked ? 'locked' : ''}`} disabled={isLocked} onClick={() => setShowCancelModal(true)}>
                <i className="fa-solid fa-xmark"></i><span>Cancel Appointment</span>
              </button>
              {isLocked && (
                <div className="cancel-reason">
                  <i className="fa-solid fa-lock"></i>
                  <span>{lockText}</span>
                </div>
              )}
              <button className={`action-btn reschedule ${isLocked ? 'locked' : ''}`} disabled={isLocked} onClick={attemptReschedule}>
                <i className="fa-solid fa-calendar-pen"></i><span>Reschedule</span>
              </button>
            </div>

            <Link to="/" className="action-btn dashboard">
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <i className={`fa-solid ${toast.icon}`}></i>
        <span>{toast.msg}</span>
      </div>

      {/* Cancel Modal */}
      <div className={`modal-overlay ${showCancelModal ? 'visible' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false); }}>
        <div className="modal-box">
          <div className="modal-icon red"><i className="fa-solid fa-xmark"></i></div>
          <h2 className="modal-title">Cancel Appointment?</h2>
          <p className="modal-text" dangerouslySetInnerHTML={{ __html: pageData.modalText }}></p>
          <p className="modal-sub">This action cannot be undone.</p>
          <div className="modal-actions-row">
            <button className="cta-btn secondary" onClick={() => setShowCancelModal(false)}>Keep Booking</button>
            <button className="cta-btn danger" onClick={confirmCancel}>Yes, Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirmation;