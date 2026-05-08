import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './css/screening-style.css';

const HealthScreening = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get incoming data from Calendar page
  const incomingCampus = searchParams.get('campus') || '';
  const incomingDate = searchParams.get('date') || '';
  const incomingTime = searchParams.get('time') || '';

  // --- State ---
  const [studentNumber, setStudentNumber] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [answers, setAnswers] = useState({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', icon: '' });

  // High-risk questions that trigger the red flag modal
  const highRiskQuestions = ['q2', 'q4', 'q5', 'q6'];

  // Services list
  const services = [
    { id: 'general', icon: 'fa-stethoscope', label: 'General Consultation' },
    { id: 'sti', icon: 'fa-shield-virus', label: 'STI Screening' },
    { id: 'hiv', icon: 'fa-microscope', label: 'HIV Testing' },
    { id: 'tb', icon: 'fa-lungs', label: 'TB Screening' },
    { id: 'family', icon: 'fa-baby', label: 'Family Planning' },
    { id: 'mental', icon: 'fa-brain', label: 'Mental Health' },
    { id: 'contraception', icon: 'fa-pills', label: 'Contraception' },
    { id: 'other', icon: 'fa-ellipsis', label: 'Other' }
  ];

  // Questions list
  const questions = [
    { id: 'q1', num: '01', text: 'Have you been sexually active without a condom in the past 3 months?' },
    { id: 'q2', num: '02', text: 'In the past 3 months have you had unusual vaginal discharge, penile discharge or genital sores?' },
    { id: 'q3', num: '03', text: 'In the past 3 months have you had a new sexual partner or more than one sexual partner?' },
    { id: 'q4', num: '04', text: 'Have you been in close contact with someone diagnosed with TB recently?' },
    { id: 'q5', num: '05', text: 'Have you had a cough lasting more than 2 weeks?' },
    { id: 'q6', num: '06', text: 'In the past month have you experienced fever, night sweats or unintentional weight loss?' }
  ];

  // --- Handlers ---
  const showToast = (msg, icon = 'fa-circle-check') => {
    setToast({ show: true, msg, icon });
    setTimeout(() => setToast({ show: false, msg: '', icon: '' }), 2800);
  };

  const handleSetAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Check for high-risk red flag trigger
    if (value === 'yes' && highRiskQuestions.includes(questionId)) {
      setShowModal(true);
    }
  };

  const handleToggleService = (serviceId) => {
    setSelectedService(prev => prev === serviceId ? null : serviceId);
  };

  // Validation logic
  const studentValid = /^\d{9}$/.test(studentNumber);
  const allAnswered = Object.keys(answers).length === 6;
  const serviceOk = selectedService !== null;
  const isFormValid = studentValid && allAnswered && serviceOk;

  const getStudentHintClass = () => {
    if (studentNumber.length === 0) return 'input-hint';
    return studentValid ? 'input-hint valid' : 'input-hint invalid';
  };

  const getStudentInputClass = () => {
    if (studentNumber.length === 0) return 'text-input';
    return studentValid ? 'text-input valid' : 'text-input invalid';
  };

  const continueToNext = () => {
    if (!isFormValid || isLoading) return;
    setIsLoading(true);

    const riskCount = highRiskQuestions.filter(q => answers[q] === 'yes').length;
    let msg = 'Screening complete';
    if (riskCount > 0) {
      msg += ` — ${riskCount} high-risk flag${riskCount > 1 ? 's' : ''} raised`;
    }
    showToast(msg);

    // Build query params for the confirmation page
    const params = new URLSearchParams({
      campus: incomingCampus,
      date: incomingDate,
      time: incomingTime,
      student: studentNumber,
      service: selectedService,
      redflags: riskCount > 0 ? '1' : '0',
      ...answers, // Spreads q1=yes, q2=no, etc.
    });

    if (specialRequests) params.append('requests', specialRequests);
    if (additionalInfo) params.append('info', additionalInfo);

    // Simulate network delay, then navigate
    setTimeout(() => {
      navigate(`/confirmation?${params.toString()}`);
    }, 1200);
  };

  const goBack = () => {
    navigate(`/calendarselection?campus=${incomingCampus}&date=${incomingDate}&time=${incomingTime}`);
  };

  // Escape key listener for modal
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);


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
            <span className="step active">3</span>
            <span className="step-line"></span>
            <span className="step">4</span>
          </div>
          <div className="avatar"><i className="fa-solid fa-user"></i></div>
        </div>
      </nav>

      <main className="main">
        <div className="page-header">
          <p className="eyebrow">Step 3 of 4</p>
          <h1 className="page-title">Health Screening</h1>
          <p className="page-subtitle">Please answer the following questions honestly. Your responses help our nurses prepare for your visit and determine priority care.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>

          {/* Student Number */}
          <section className="form-section">
            <label className="field-label" htmlFor="studentNumber">
              <i className="fa-solid fa-id-card"></i>
              Student Number
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="studentNumber"
                className={getStudentInputClass()}
                placeholder="e.g. 218123456"
                maxLength={9}
                autoComplete="off"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.replace(/\D/g, ''))} // Only allow numbers
              >
              </input>
              <span className={getStudentHintClass()}>9-digit UJ student number</span>
            </div>
          </section>

          {/* Service Required */}
          <section className="form-section">
            <label className="field-label">
              <i className="fa-solid fa-hand-holding-medical"></i>
              Service Required
            </label>
            <div className="service-grid">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  className={`service-chip ${selectedService === svc.id ? 'selected' : ''}`}
                  onClick={() => handleToggleService(svc.id)}
                >
                  <i className={`fa-solid ${svc.icon}`}></i>
                  <span>{svc.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="section-divider"><span>Symptom Checklist</span></div>

          {/* Questions */}
          {questions.map((q) => (
            <div
              key={q.id}
              className={`question-card ${answers[q.id] === 'yes' ? 'answered-yes' : answers[q.id] === 'no' ? 'answered-no' : ''}`}
              data-question={q.id}
            >
              <div className="question-text">
                <span className="q-number">{q.num}</span>
                <p>{q.text}</p>
              </div>
              <div className="toggle-group">
                <label className="toggle-option">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === 'yes'}
                    onChange={() => handleSetAnswer(q.id, 'yes')}
                  />
                  <span className="toggle-track yes">
                    <span className="toggle-thumb"></span>
                  </span>
                  <span className="toggle-text">Yes</span>
                </label>
                <label className="toggle-option">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === 'no'}
                    onChange={() => handleSetAnswer(q.id, 'no')}
                  />
                  <span className="toggle-track no">
                    <span className="toggle-thumb"></span>
                  </span>
                  <span className="toggle-text">No</span>
                </label>
              </div>
            </div>
          ))}

          {/* Special Requests */}
          <section className="form-section">
            <label className="field-label" htmlFor="specialRequests">
              <i className="fa-solid fa-comment-medical"></i>
              Add any special requests
            </label>
            <textarea
              id="specialRequests"
              className="text-area"
              placeholder="E.g. prefer a female nurse, wheelchair access needed..."
              rows="3"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            ></textarea>
          </section>

          {/* Additional Info */}
          <section className="form-section">
            <label className="field-label" htmlFor="additionalInfo">
              <i className="fa-solid fa-file-medical"></i>
              Provide additional information
            </label>
            <textarea
              id="additionalInfo"
              className="text-area"
              placeholder="Any other relevant medical information the nurse should know..."
              rows="3"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            ></textarea>
          </section>

          {/* Disclaimer */}
          <div className="disclaimer-box">
            <div className="disclaimer-icon"><i className="fa-solid fa-lock"></i></div>
            <div className="disclaimer-content">
              <p className="disclaimer-title">Confidentiality Notice</p>
              <p className="disclaimer-text">Please note all visits are confidential and privacy are maintained at all times. Please let us know if you have any COVID-19 symptoms by replying to this email address:</p>
              <a href="mailto:clinicbookings@uj.ac.za" className="disclaimer-email">clinicbookings@uj.ac.za</a>
            </div>
          </div>

          {/* COVID Priority Notice */}
          <div className="covid-notice">
            <div className="covid-notice-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <p>If you suspect you may have COVID-19, <strong>do not continue with this booking.</strong> We will give priority to your COVID-19 related request. Email us directly using the address above.</p>
          </div>

          {/* CTA Buttons */}
          <div className="cta-row">
            <button type="button" className="cta-btn secondary" onClick={goBack}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <button
              type="button"
              className="cta-btn primary"
              disabled={!isFormValid || isLoading}
              onClick={continueToNext}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i><span>Submitting...</span></>
              ) : (
                <><span>Review Booking</span><i className="fa-solid fa-arrow-right"></i></>
              )}
            </button>
          </div>

        </form>
      </main>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <i className={`fa-solid ${toast.icon}`}></i>
        <span>{toast.msg}</span>
      </div>

      {/* Red Flag Warning Modal */}
      <div
        className={`modal-overlay ${showModal ? 'visible' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
      >
        <div className="modal-box">
          <div className="modal-icon red"><i className="fa-solid fa-flag"></i></div>
          <h2 className="modal-title">High-Risk Symptoms Detected</h2>
          <p className="modal-text">Your responses indicate potential high-risk symptoms. A red flag alert will be sent to the nurse on duty to prioritise your consultation.</p>
          <p className="modal-sub">You may still proceed with your booking.</p>
          <div className="modal-actions">
            <button className="cta-btn primary" onClick={() => setShowModal(false)}>
              <span>I Understand, Continue</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthScreening;