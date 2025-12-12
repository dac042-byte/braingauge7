import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import WeeklyCheckIn from './components/WeeklyCheckIn';
import Insights from './components/Insights';
import Profile from './components/Profile';
import './App.css';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/checkin', label: 'Check-In', icon: '✓' },
    { path: '/insights', label: 'Insights', icon: '💡' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="navigation">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">🧠 BrainGauge</h1>
          <p className="app-subtitle">Cognitive Performance Tracker</p>
        </header>

        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/checkin" element={<WeeklyCheckIn />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        <Navigation />
      </div>
    </Router>
  );
}

export default App;
