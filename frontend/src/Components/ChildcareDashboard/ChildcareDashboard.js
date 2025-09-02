import React from "react";
import "./ChildcareDashboard.css"; // Import CSS

export default function ChildcareDashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🍼 Childcare Management Dashboard</h1>

      <div className="dashboard-grid">
        <button className="dashboard-btn create">➕ Create Child Record</button>
        <button className="dashboard-btn read">📖 View Records</button>
        <button className="dashboard-btn update">✏️ Update Progress</button>
        <button className="dashboard-btn delete">🗑️ Delete Records</button>
      </div>
    </div>
  );
}
