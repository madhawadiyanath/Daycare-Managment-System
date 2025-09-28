import React, { useEffect, useState } from "react";
import "./ChildcareDashboard.css";
import Nav from "../Nav/Nav";
import CreateChild from "./CreateChild";
import ViewChildren from "./ViewChildren";
// Removed UpdateChild and DeleteChild sections
import { useNavigate } from "react-router-dom";
import Calendar from "./Calendar";

export default function ChildcareDashboard() {
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Require parent login to access ChildcareDashboard
    const parentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!parentUser) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <Nav/>
      <div className="dashboard">
        <h1 className="title">Childcare Management Dashboard</h1>

        <div className="button-container">
          <button onClick={() => setActiveSection("create")}>➕ Create Child Record</button>
          <button onClick={() => setActiveSection("view")}>📖 View Records</button>
          <button onClick={() => setActiveSection("calendar")}>📅 Calendar</button>
        </div>

        <div className="section-container">
          {activeSection === "create" && (
            <div className="section fade-in">
              <CreateChild/>
            </div>
          )}
          {activeSection === "view" && (
            <div className="section fade-in">
              <ViewChildren/>
            </div>
          )}
          {activeSection === "calendar" && (
            <div className="section fade-in">
              <Calendar onDateSelect={(date) => console.log('Selected date:', date)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
