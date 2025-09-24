import React from 'react';
import { Link } from 'react-router-dom';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || 'null');

  return (
    <div className="t-dashboard">
      <div className="t-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="subtitle">Welcome{teacher ? `, ${teacher.name || teacher.username}` : ''}</p>
        </div>
        {teacher && (
          <div className="t-profile">
            <span className="username">{teacher.username}</span>
            <span className="email">{teacher.email}</span>
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>Quick Links</h3>
          <div className="actions">
            <Link to="/ChildcareDashboard" className="btn">Childcare Dashboard</Link>
            <Link to="/goHome" className="btn">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
