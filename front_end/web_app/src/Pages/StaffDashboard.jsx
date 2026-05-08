import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/staff-portal.css'; 
import './css/theme.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('apk');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', icon: '' });
  const [staffData, setStaffData] = useState({ firstName: 'Staff', role: 'staff' });

  useEffect(() => {
    const storedUser = localStorage.getItem('cshaw_user');
    if (storedUser) {
      setStaffData(JSON.parse(storedUser));
    }
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/staff/walkins?campus=${selectedCampus}`);
      const data = await res.json();
      if (res.ok) setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [selectedCampus]);

  const updateStatus = async (checkinId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/staff/walkins/${checkinId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const inProgress = queue.filter(q => q.status === 'in_progress');
  const waiting = queue.filter(q => q.status === 'waiting');

  return (
    <div className="staff-portal-container">
      <nav className="staff-topbar">
        <div className="topbar-left">
          <div className="staff-logo-mark"><i className="fa-solid fa-house-medical"></i></div>
          <span className="staff-logo-text">C-SHAW <small>Staff Portal</small></span>
        </div>
        <div className="topbar-right">
          <div className="staff-user-info">
            <p>On Duty: <strong>{staffData.firstName} {staffData.lastName}</strong></p>
            <span className="role-tag">{staffData.role}</span>
          </div>
          <button className="logout-btn" onClick={() => navigate('/')}>
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      </nav>

      <main className="main-staff">
        <header className="staff-header">
          <div className="header-left">
            <h1>Clinic Management</h1>
            <p>Live Queue for {selectedCampus.toUpperCase()} Campus</p>
          </div>
          
          <div className="header-actions">
            <select 
              className="staff-select"
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
            >
              <option value="apk">APK Clinic</option>
              <option value="dfc">DFC Clinic</option>
              <option value="apb">APB Clinic</option>
              <option value="swc">SWC Clinic</option>
            </select>
            
            <button className="action-btn-staff refresh" onClick={fetchQueue}>
               <i className="fa-solid fa-rotate"></i>
            </button>

            <button className="action-btn-staff primary" onClick={() => navigate('/walkin')}>
               <i className="fa-solid fa-plus"></i> Add Walk-In
            </button>
          </div>
        </header>

        <div className="queue-board">
          {/* COLUMN 1: SERVING */}
          <div className="queue-col">
            <div className="col-header serving">
              <i className="fa-solid fa-stethoscope"></i>
              Currently Serving
              <span className="count-badge">{inProgress.length}</span>
            </div>
            <div className="col-body">
              {inProgress.map(p => (
                <PatientCard key={p.checkin_id} patient={p} updateStatus={updateStatus} />
              ))}
              {inProgress.length === 0 && <div className="empty-state">No active consultations</div>}
            </div>
          </div>

          {/* COLUMN 2: WAITING */}
          <div className="queue-col">
            <div className="col-header waiting">
              <i className="fa-solid fa-clock"></i>
              Waiting Room
              <span className="count-badge">{waiting.length}</span>
            </div>
            <div className="col-body">
              {waiting.map(p => (
                <PatientCard key={p.checkin_id} patient={p} updateStatus={updateStatus} />
              ))}
              {waiting.length === 0 && <div className="empty-state">Waiting room is empty</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const PatientCard = ({ patient, updateStatus }) => {
  const isEmergency = patient.queue_number.startsWith('E');
  const isInProgress = patient.status === 'in_progress';

  return (
    <div className={`queue-card ${isEmergency ? 'emergency' : ''} ${isInProgress ? 'active' : ''}`}>
      <div className="card-side-indicator"></div>
      <div className="card-inner">
        <div className="card-top-row">
          <span className="q-number-box">{patient.queue_number}</span>
          <div className="patient-name-info">
            <h3>{patient.first_name} {patient.last_name}</h3>
            <p>{patient.identifier}</p>
          </div>
        </div>
        
        <div className="card-mid-row">
          <span className="service-label"><i className="fa-solid fa-hand-holding-medical"></i> {patient.service_name}</span>
        </div>

        <div className="card-footer-actions">
          {patient.status === 'waiting' ? (
            <>
              <button className="staff-btn call" onClick={() => updateStatus(patient.checkin_id, 'in_progress')}>
                <i className="fa-solid fa-bullhorn"></i> Call Patient
              </button>
              <button className="staff-btn noshow" onClick={() => updateStatus(patient.checkin_id, 'no-show')}>
                No Show
              </button>
            </>
          ) : (
            <button className="staff-btn finish" onClick={() => updateStatus(patient.checkin_id, 'completed')}>
              <i className="fa-solid fa-check-circle"></i> Complete Session
            </button>
          )}
        </div>
      </div>
      {isEmergency && <div className="emergency-ribbon">URGENT</div>}
    </div>
  );
};

export default StaffDashboard;