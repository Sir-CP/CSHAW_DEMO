import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import CampusSelection from "./Pages/CampusSelection";
import CalendarSelection from "./Pages/calendar";
import HealthScreening from "./Pages/HealthScreening";
import Confirmation from "./Pages/Confirmation";
import WalkIn from "./Pages/WalkIn";
import WalkInConfirmation from "./Pages/WalkInConfirmation";
import StaffDashboard from './Pages/StaffDashboard'; // Adjust path if needed

import reactLogo from './assets/react.svg'
import './App.css'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campusselection" element={<CampusSelection />} />
		<Route path="/calendarselection" element={<CalendarSelection />} />
		<Route path="/screening" element={<HealthScreening />} />
		<Route path="/confirmation" element={<Confirmation />} />
    <Route path="/walkin" element={<WalkIn />} />
        <Route path="/walkin-confirmation" element={<WalkInConfirmation />}/>
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;