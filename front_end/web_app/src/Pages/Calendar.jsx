import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './css/calendar-style.css';

const CalendarSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- Config & Constants ---
  const campusCode = searchParams.get('campus') || 'apk';
  const campusNames = {
    apk: 'APK — Auckland Park',
    dfc: 'DFC — Doornfontein',
    apb: 'APB — Auckland Park B',
    swc: 'SWC — Soweto Campus'
  };
  const campusLabel = campusNames[campusCode] || campusNames.apk;

  const CLINIC_START = 8 * 60;
  const CLINIC_END = 18 * 60;
  const SLOT_DURATION = 15;
  const BUFFER_MINUTES = 15;
  const BOOKED_INDICES = new Set([0, 1, 4, 7, 8, 9, 13, 16, 17, 21, 24, 25, 29, 33, 34]);

  // --- State ---
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // --- Time Calculations (Memoized so they don't cause infinite loops) ---
  const timeInfo = useMemo(() => {
    const now = new Date();
    return {
      now,
      todayDate: now.getDate(),
      todayMonth: now.getMonth(),
      todayYear: now.getFullYear(),
      todayDayOfWeek: now.getDay(),
      isTodayWeekday: now.getDay() >= 1 && now.getDay() <= 5,
      nowMinutes: now.getHours() * 60 + now.getMinutes()
    };
  }, []);

  // --- Handlers ---
  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2500);
  };

  const handleSelectDate = (day) => {
    setSelectedDate(day);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    showToast(`${time} slot selected`);
  };

  const clearSelection = () => {
    setSelectedTime(null);
    showToast('Selection cleared');
  };

  const continueToNext = () => {
    if (!selectedDate || !selectedTime || isLoading) return;
    setIsLoading(true);

    const dateISO = `${timeInfo.todayYear}-${String(timeInfo.todayMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

    // Simulate network delay before navigating
    setTimeout(() => {
      navigate(`/screening?campus=${campusCode}&date=${dateISO}&time=${selectedTime}`);
    }, 800);
  };

  // --- Derived Data (Calendar Grid) ---
  const calendarCells = useMemo(() => {
    const { todayYear: year, todayMonth: month, todayDate: tDate, isTodayWeekday: isWeekday } = timeInfo;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayRaw = new Date(year, month, 1).getDay();
    const startOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
    
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const cells = [];
    
    // Empty offset days
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isPast = d < tDate;
      const isToday = d === tDate;
      const isFuture = d > tDate;

      let state = '';
      if (isPast) state = 'past';
      else if (isToday && isWeekend) state = 'today-weekend';
      else if (isToday && !isWeekend) state = 'today';
      else if (isFuture && isWeekend) state = 'future-weekend';
      else if (isFuture) state = 'future';

      cells.push(
        <div 
          key={d} 
          className={`cal-day ${state} ${selectedDate === d ? 'selected' : ''}`}
          onClick={() => state === 'today' && handleSelectDate(d)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (state === 'today') handleSelectDate(d); }}}
          tabIndex={state === 'today' ? 0 : -1}
          role={state === 'today' ? 'button' : undefined}
          aria-label={state === 'today' ? `Select today, ${monthName.split(' ')[0]} ${d}` : undefined}
        >
          <span className="cal-num">{d}</span>
          {state === 'today' && <span className="cal-tag tag-today">Today</span>}
          {state === 'future' && <span className="cal-tag tag-locked"><i className="fa-solid fa-lock"></i> 00:00</span>}
          {(state === 'future-weekend' || state === 'today-weekend') && <span className="cal-tag tag-weekend">Weekend</span>}
        </div>
      );
    }

    return { cells, monthName };
  }, [timeInfo, selectedDate]);

  // --- Derived Data (Time Slots) ---
  const timeSlots = useMemo(() => {
    if (selectedDate === null) return { slots: [], availableCount: 0, dateStr: '' };

    const { todayYear, todayMonth, nowMinutes, isTodayWeekday: isWeekday } = timeInfo;
    const dateStr = new Date(todayYear, todayMonth, selectedDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });

    const slots = [];
    let availableCount = 0;

    for (let mins = CLINIC_START; mins < CLINIC_END; mins += SLOT_DURATION) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const minsFromNow = mins - nowMinutes;

      let status = 'available';
      let reason = '';

      if (minsFromNow < 0) {
        status = 'past'; reason = 'Passed';
      } else if (minsFromNow < BUFFER_MINUTES) {
        status = 'soon'; reason = `${Math.round(minsFromNow)} min away`;
      } else {
        const slotIdx = Math.floor((mins - CLINIC_START) / SLOT_DURATION);
        if (BOOKED_INDICES.has(slotIdx)) {
          status = 'booked'; reason = 'Booked';
        }
      }

      if (status === 'available') availableCount++;

      slots.push({ timeStr, status, reason });
    }

    return { slots, availableCount, dateStr };
  }, [selectedDate, timeInfo]);

  // --- Summary Text Logic ---
  const getSummaryText = () => {
    if (!selectedDate || !selectedTime) return null;
    const { todayYear, todayMonth } = timeInfo;
    const dateStr = new Date(todayYear, todayMonth, selectedDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    const parts = selectedTime.split(':');
    let h12 = parseInt(parts[0]);
    const ampm = h12 >= 12 ? 'PM' : 'AM';
    if (h12 > 12) h12 -= 12;
    if (h12 === 0) h12 = 12;
    const time12 = `${h12}:${parts[1]} ${ampm}`;

    return { dateStr, time12 };
  };

  const summary = getSummaryText();

  // --- No Slots Message Logic ---
  const getNoSlotsMessage = () => {
    if (selectedDate !== null) return null; // Only show if no date selected OR if it's a weekend
    if (!timeInfo.isTodayWeekday) return 'No appointments available on weekends. Next available slots open on Monday at 00:00.';
    if (timeInfo.nowMinutes >= CLINIC_END) return 'Clinic hours have ended for today (08:00–17:00). Please try again tomorrow morning.';
    return 'All remaining slots are either booked or start within 15 minutes. Check back shortly.';
  };


  return (
    <>
      {/* Ambient background blobs */}
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
            <span className="step completed"><i className="fa-solid fa-check"></i></span>
            <span className="step-line filled"></span>
            <span className="step active">2</span>
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

        {/* Back Link */}
        <Link to="/campusselection" className="back-link">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to Campus Selection</span>
        </Link>

        {/* Header Section */}
        <div className="page-header">
          <p className="eyebrow">Step 2 of 4</p>
          <h1 className="page-title">Select Date & Time</h1>
          <p className="page-subtitle">Pick today's date and an available 15-minute slot. Appointments open at midnight on the day of your visit.</p>
        </div>

        {/* Rules Banner */}
        <div className="rules-banner">
          <div className="rule-item">
            <div className="rule-icon"><i class="fa-solid fa-clock"></i></div>
            <div className="rule-text">
              <strong>Same-day only</strong>
              <span>Slots unlock at 00:00 on the appointment day</span>
            </div>
          </div>
          <div className="rule-divider"></div>
          <div className="rule-item">
            <div className="rule-icon"><i class="fa-solid fa-hourglass-half"></i></div>
            <div className="rule-text">
              <strong>15-min buffer</strong>
              <span>Slots starting in under 15 minutes are locked</span>
            </div>
          </div>
          <div className="rule-divider"></div>
          <div className="rule-item">
            <div className="rule-icon"><i class="fa-solid fa-calendar-xmark"></i></div>
            <div className="rule-text">
              <strong>Weekdays only</strong>
              <span>No weekend or public holiday appointments</span>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <section className="calendar-section">
          <div className="calendar-card">
            <div className="calendar-header">
              <h2 className="month-label">{calendarCells.monthName}</h2>
              <span className="calendar-hint">Only today is bookable</span>
            </div>

            <div className="cal-grid cal-headers">
              <div className="cal-head">Mon</div>
              <div className="cal-head">Tue</div>
              <div className="cal-head">Wed</div>
              <div className="cal-head">Thu</div>
              <div className="cal-head">Fri</div>
              <div className="cal-head weekend-head">Sat</div>
              <div className="cal-head weekend-head">Sun</div>
            </div>

            <div className="cal-grid cal-days">
              {calendarCells.cells}
            </div>
          </div>
        </section>

        {/* Time Slots Section */}
        <section className={`slots-section ${selectedDate !== null || !timeInfo.isTodayWeekday ? 'visible' : ''}`}>
          <div className="slots-header">
            <h2 className="slots-title">{selectedDate !== null ? `Time Slots — ${timeSlots.dateStr}` : 'Available Time Slots'}</h2>
            <div className="slots-legend">
              <span className="legend-item"><span className="legend-dot available"></span> Available</span>
              <span className="legend-item"><span className="legend-dot soon"></span> Too soon</span>
              <span className="legend-item"><span className="legend-dot booked"></span> Booked</span>
              <span className="legend-item"><span className="legend-dot past"></span> Passed</span>
            </div>
          </div>

          {/* No slots message */}
          {(timeSlots.availableCount === 0 && selectedDate !== null) || (!timeInfo.isTodayWeekday && selectedDate === null) ? (
            <div className="no-slots">
              <div className="no-slots-icon"><i className="fa-solid fa-calendar-circle-exclamation"></i></div>
              <p className="no-slots-text">{getNoSlotsMessage()}</p>
            </div>
          ) : null}

          {/* Slots grid */}
          {selectedDate !== null && (
            <div className="slots-grid">
              {timeSlots.slots.map((slot) => (
                <button
                  key={slot.timeStr}
                  className={`slot slot-${slot.status} ${selectedTime === slot.timeStr ? 'selected' : ''}`}
                  disabled={slot.status !== 'available'}
                  onClick={() => handleSelectTime(slot.timeStr)}
                >
                  <span className="slot-time">{slot.timeStr}</span>
                  {slot.reason && <span className="slot-reason">{slot.reason}</span>}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Selection Summary */}
        {summary && (
          <div className="summary-card visible">
            <div className="summary-left">
              <div className="summary-icon"><i className="fa-solid fa-calendar-check"></i></div>
              <div className="summary-details">
                <p className="summary-campus">{campusLabel}</p>
                <p className="summary-datetime">{summary.dateStr} · {summary.time12}</p>
              </div>
            </div>
            <button className="summary-edit" onClick={clearSelection}>
              <i className="fa-solid fa-pen"></i>
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Continue Button */}
        <div className="cta-wrapper">
          <button 
            className="cta-btn" 
            disabled={!selectedDate || !selectedTime || isLoading} 
            onClick={continueToNext}
          >
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i><span>Loading...</span></>
            ) : (
              <><span>Continue to Health Screening</span><i className="fa-solid fa-arrow-right"></i></>
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

export default CalendarSelection;