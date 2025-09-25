import React from 'react';
import { Link } from 'react-router-dom';
import './StaffDashboard.css';

function StaffDashboard() {
  const staff = JSON.parse(localStorage.getItem('staff') || 'null');

  return (
    <div className="s-dashboard">
      <div className="s-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p className="subtitle">Welcome{staff ? `, ${staff.name || staff.username}` : ''}</p>
        </div>
        {staff && (
          <div className="s-profile">
            <span className="username">{staff.username}</span>
            <span className="email">{staff.email}</span>
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>Quick Links</h3>
          <div className="actions">
            <Link to="/goHome" className="btn">Home</Link>
            <Link to="/ChildcareDashboard" className="btn">Childcare</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
