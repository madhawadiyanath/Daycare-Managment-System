import React, { useEffect, useState } from "react";
import "./ChildcareDashboard.css";
import Nav from "../Nav/Nav";
import CreateChild from "./CreateChild";
import ViewChildren from "./ViewChildren";
// Removed UpdateChild and DeleteChild sections
import { useNavigate } from "react-router-dom";
import Calendar from "./Calendar";
import Chatbot from "./Chatbot";

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Nav/>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Modern Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          marginTop: '6rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Childcare Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
            Manage your child's daycare experience with ease
          </p>
        </div>

        {/* Modern Navigation Cards */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          <div
            onClick={() => setActiveSection("create")}
            style={{
              background: activeSection === "create" 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === "create"
                ? '0 10px 25px -5px rgba(16, 185, 129, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === "create" ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === "create" ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '200px',
              flex: '0 0 auto'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>➕</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
              Create Child Record
            </h3>
          </div>

          <div
            onClick={() => setActiveSection("view")}
            style={{
              background: activeSection === "view" 
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === "view"
                ? '0 10px 25px -5px rgba(59, 130, 246, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === "view" ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === "view" ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '200px',
              flex: '0 0 auto'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📖</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
              View Records
            </h3>
          </div>

          <div
            onClick={() => setActiveSection("calendar")}
            style={{
              background: activeSection === "calendar" 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === "calendar"
                ? '0 10px 25px -5px rgba(245, 158, 11, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === "calendar" ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === "calendar" ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '200px',
              flex: '0 0 auto'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
              Calendar
            </h3>
          </div>

          <div
            onClick={() => setActiveSection("chatbot")}
            style={{
              background: activeSection === "chatbot" 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === "chatbot"
                ? '0 10px 25px -5px rgba(139, 92, 246, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === "chatbot" ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === "chatbot" ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '200px',
              flex: '0 0 auto'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
              Ask Assistant
            </h3>
          </div>
        </div>

        {/* Modern Content Container */}
        {activeSection && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            {activeSection === "create" && <CreateChild/>}
            {activeSection === "view" && <ViewChildren/>}
            {activeSection === "calendar" && <Calendar onDateSelect={(date) => console.log('Selected date:', date)} />}
            {activeSection === "chatbot" && <Chatbot />}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
