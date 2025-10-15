import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './StaffDashboard.css';

function StaffDashboard() {
  const staff = JSON.parse(localStorage.getItem('staff') || 'null');
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  // Child lookup state
  const [childIdInput, setChildIdInput] = useState('');
  const [childLoading, setChildLoading] = useState(false);
  const [childError, setChildError] = useState('');
  const [childDetails, setChildDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: '', parent: '', healthNotes: '', checkInTime: '', checkOutTime: '', meals: '', napTimes: '', healthStatus: '', incidents: '', medication: '', moodBehavior: '', interactions: '' });
  // Calendar event form state
  const [eventForm, setEventForm] = useState({ title: '', date: '', description: '', childId: '' });
  const [evtSubmitting, setEvtSubmitting] = useState(false);
  const [evtError, setEvtError] = useState('');
  const [evtSuccess, setEvtSuccess] = useState('');
  // Events list management
  const [evList, setEvList] = useState([]);
  const [evLoading, setEvLoading] = useState(false);
  const [evError, setEvError] = useState('');
  const [evEditingId, setEvEditingId] = useState(null);
  const [evEditForm, setEvEditForm] = useState({ title: '', date: '', description: '', childId: '' });
  // Active section state
  const [activeSection, setActiveSection] = useState('pending');

  const tzOffsetMs = new Date().getTimezoneOffset() * 60000;
  const todayStr = new Date(Date.now() - tzOffsetMs).toISOString().slice(0, 10);
  const maxStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - tzOffsetMs).toISOString().slice(0, 10);

  async function fetchEventsForMonth(baseDate = new Date()) {
    try {
      setEvLoading(true);
      setEvError('');
      const y = baseDate.getFullYear();
      const m = baseDate.getMonth();
      const from = new Date(y, m, 1).toISOString().slice(0, 10);
      const to = new Date(y, m + 1, 0).toISOString().slice(0, 10);
      const res = await axios.get('http://localhost:5000/calendar/events', { params: { from, to } });
      setEvList(res.data?.data || []);
    } catch (err) {
      setEvError(err?.response?.data?.message || 'Failed to load events');
    } finally {
      setEvLoading(false);
    }
  }

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5000/child-requests/pending');
      setPending(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const lookupChild = async () => {
    setChildError('');
    setChildDetails(null);
    const id = childIdInput.trim();
    if (!id) {
      setChildError('Please enter a Child ID');
      return;
    }
    try {
      setChildLoading(true);
      const res = await axios.get(`http://localhost:5000/children/${encodeURIComponent(id)}`);
      if (res.data?.success) {
        setChildDetails(res.data.data);
        setEditing(false);
        setEditForm({
          name: res.data.data.name || '',
          age: res.data.data.age || '',
          gender: res.data.data.gender || '',
          parent: res.data.data.parent || '',
          healthNotes: res.data.data.healthNotes || '',
          checkInTime: res.data.data.checkInTime || '',
          checkOutTime: res.data.data.checkOutTime || '',
          meals: res.data.data.meals || '',
          napTimes: res.data.data.napTimes || '',
          healthStatus: res.data.data.healthStatus || '',
          incidents: res.data.data.incidents || '',
          medication: res.data.data.medication || '',
          moodBehavior: res.data.data.moodBehavior || '',
          interactions: res.data.data.interactions || '',
        });
      } else {
        setChildError(res.data?.message || 'Child not found');
      }
    } catch (err) {
      setChildError(err?.response?.data?.message || 'Child not found');
    } finally {
      setChildLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)' }}>
      {/* Modern Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Staff Dashboard
            </h1>
            <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Welcome{staff ? `, ${staff.name || staff.username}` : ''}
            </p>
          </div>
          
          {staff && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'rgba(30, 58, 138, 0.1)',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#1e3a8a' }}>{staff.username}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{staff.email}</div>
              </div>
              <Link 
                to="/login" 
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          <div
            onClick={() => setActiveSection('pending')}
            style={{
              background: activeSection === 'pending' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 'pending'
                ? '0 10px 25px -5px rgba(16, 185, 129, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === 'pending' ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === 'pending' ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '180px'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>
              Pending Requests
            </h3>
          </div>

          <div
            onClick={() => setActiveSection('calendar')}
            style={{
              background: activeSection === 'calendar' 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 'calendar'
                ? '0 10px 25px -5px rgba(245, 158, 11, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === 'calendar' ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === 'calendar' ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '180px'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>
              Calendar Events
            </h3>
          </div>

          <div
            onClick={() => setActiveSection('children')}
            style={{
              background: activeSection === 'children' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 'children'
                ? '0 10px 25px -5px rgba(59, 130, 246, 0.25)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: activeSection === 'children' ? 'translateY(-2px)' : 'translateY(0)',
              color: activeSection === 'children' ? 'white' : '#1f2937',
              textAlign: 'center',
              minWidth: '180px'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👶</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>
              Child Details
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
            {/* Quick Links */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Quick Navigation</h3>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to="/goHome" 
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  🏠 Home
                </Link>
                <Link 
                  to="/ChildcareDashboard" 
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  👶 Childcare
                </Link>
              </div>
            </div>

            {/* Conditional Content Based on Active Section */}
            {activeSection === 'pending' && (
              <div>
                {/* Pending Child Requests */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
          <div className="list-header">
            <h3>Pending Child Requests</h3>
            <button className="btn btn-secondary" type="button" onClick={fetchPending}>Refresh</button>
          </div>
          {error && <div className="form-error">{error}</div>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Parent</th>
                    <th>Health Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>No pending requests</td>
                    </tr>
                  ) : (
                    pending.map((req) => (
                      <tr key={req._id}>
                        <td>{req.name}</td>
                        <td>{req.age}</td>
                        <td>{req.gender}</td>
                        <td>{req.parent}</td>
                        <td>{req.healthNotes || '-'}</td>
                        <td className="actions-cell">
                          <div className="row-actions">
                            <button
                              className="btn"
                              type="button"
                              disabled={actioningId === req._id}
                              onClick={async () => {
                                if (!staff?._id) { alert('Missing staff ID. Please re-login.'); return; }
                                const childId = window.prompt('Enter Child ID to assign (must be unique):');
                                if (!childId || !childId.trim()) { return; }
                                setActioningId(req._id);
                                try {
                                  const res = await axios.post(`http://localhost:5000/child-requests/${req._id}/approve`, { staffId: staff._id, childId: childId.trim() });
                                  if (res.data?.success) {
                                    const createdChildId = res.data?.data?.child?.childId;
                                    alert(`Approved. Child created with ID: ${createdChildId}`);
                                    await fetchPending();
                                  } else {
                                    alert(res.data?.message || 'Failed to approve');
                                  }
                                } catch (err) {
                                  alert(err?.response?.data?.message || 'Failed to approve');
                                } finally {
                                  setActioningId(null);
                                }
                              }}
                            >
                              {actioningId === req._id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              className="btn btn-danger"
                              type="button"
                              disabled={actioningId === req._id}
                              onClick={async () => {
                                setActioningId(req._id);
                                try {
                                  const res = await axios.post(`http://localhost:5000/child-requests/${req._id}/reject`);
                                  if (res.data?.success) {
                                    await fetchPending();
                                  } else {
                                    alert(res.data?.message || 'Failed to reject');
                                  }
                                } catch (err) {
                                  alert(err?.response?.data?.message || 'Failed to reject');
                                } finally {
                                  setActioningId(null);
                                }
                              }}
                            >
                              {actioningId === req._id ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Calendar Event (moved above View Child Details) */}
        <div className="card full-width">
          <h3>Add Calendar Event</h3>
          <form
            className="fm-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setEvtError('');
              setEvtSuccess('');
              if (!eventForm.title.trim() || !eventForm.date) {
                setEvtError('Title and Date are required');
                return;
              }
              // Enforce date within [today, today+30 days]
              try {
                const sel = new Date(eventForm.date);
                const min = new Date(todayStr);
                const max = new Date(maxStr);
                if (isNaN(sel.getTime()) || sel < min || sel > max) {
                  setEvtError(`Date must be between ${todayStr} and ${maxStr}`);
                  return;
                }
              } catch (_) {
                setEvtError('Invalid date');
                return;
              }
              setEvtSubmitting(true);
              try {
                const payload = {
                  title: eventForm.title.trim(),
                  date: eventForm.date,
                  description: eventForm.description?.trim?.() || '',
                  childId: eventForm.childId?.trim?.() || undefined,
                  createdBy: staff?._id,
                };
                const res = await axios.post('http://localhost:5000/calendar/events', payload);
                if (res.data?.success) {
                  setEvtSuccess('Event created');
                  setEventForm({ title: '', date: '', description: '', childId: '' });
                  await fetchEventsForMonth(new Date(payload.date));
                } else {
                  setEvtError(res.data?.message || 'Failed to create event');
                }
              } catch (err) {
                setEvtError(err?.response?.data?.message || 'Failed to create event');
              } finally {
                setEvtSubmitting(false);
              }
            }}
          >
            {evtError && <div className="form-error">{evtError}</div>}
            {evtSuccess && <div className="form-success">{evtSuccess}</div>}
            <div className="row">
              <div className="col">
                <label>Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(v)) {
                      setEventForm({ ...eventForm, title: v });
                    }
                  }}
                  placeholder="Event title"
                  pattern="[A-Za-z\s]*"
                />
              </div>
              <div className="col">
                <label>Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  min={todayStr}
                  max={maxStr}
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label>Description</label>
                <input
                  type="text"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
              <div className="col">
                <label>Child ID (optional)</label>
                <input
                  type="text"
                  value={eventForm.childId}
                  onChange={(e) => setEventForm({ ...eventForm, childId: e.target.value })}
                  placeholder="Link to a child"
                />
              </div>
            </div>
            <button className="btn" type="submit" disabled={evtSubmitting}>
              {evtSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>

        {/* Manage Calendar Events (below Add Calendar Event) */}
        <div className="card full-width">
          <div className="list-header">
            <h3>Manage Calendar Events</h3>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => fetchEventsForMonth(new Date())}
            >
              Refresh
            </button>
          </div>
          {evError && <div className="form-error">{evError}</div>}
          {evLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Child ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No events</td>
                    </tr>
                  ) : (
                    evList.map((ev) => (
                      <tr key={ev._id}>
                        {evEditingId === ev._id ? (
                          <>
                            <td>
                              <input
                                className="table-input"
                                type="text"
                                value={evEditForm.title}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (/^[A-Za-z\s]*$/.test(v)) {
                                    setEvEditForm({ ...evEditForm, title: v });
                                  }
                                }}
                                pattern="[A-Za-z\s]*"
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="date"
                                value={evEditForm.date}
                                onChange={(e) => setEvEditForm({ ...evEditForm, date: e.target.value })}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="text"
                                value={evEditForm.description || ''}
                                onChange={(e) => setEvEditForm({ ...evEditForm, description: e.target.value })}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="text"
                                value={evEditForm.childId || ''}
                                onChange={(e) => setEvEditForm({ ...evEditForm, childId: e.target.value })}
                              />
                            </td>
                            <td className="actions-cell">
                              <div className="row-actions">
                                <button
                                  className="btn"
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await axios.put(`http://localhost:5000/calendar/events/${ev._id}`, {
                                        title: evEditForm.title,
                                        date: evEditForm.date,
                                        description: evEditForm.description,
                                        childId: evEditForm.childId,
                                      });
                                      setEvEditingId(null);
                                      setEvEditForm({ title: '', date: '', description: '', childId: '' });
                                      await fetchEventsForMonth(new Date(evEditForm.date || ev.date));
                                    } catch (err) {
                                      alert(err?.response?.data?.message || 'Failed to update event');
                                    }
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  onClick={() => { setEvEditingId(null); setEvEditForm({ title: '', date: '', description: '', childId: '' }); }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{ev.title}</td>
                            <td>{new Date(ev.date).toLocaleDateString()}</td>
                            <td>{ev.description || '-'}</td>
                            <td>{ev.childId || '-'}</td>
                            <td className="actions-cell">
                              <div className="row-actions">
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  onClick={() => {
                                    setEvEditingId(ev._id);
                                    setEvEditForm({
                                      title: ev.title || '',
                                      date: (new Date(ev.date).toISOString().slice(0, 10)),
                                      description: ev.description || '',
                                      childId: ev.childId || '',
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger"
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm('Delete this event?')) return;
                                    try {
                                      await axios.delete(`http://localhost:5000/calendar/events/${ev._id}`);
                                      await fetchEventsForMonth(new Date(ev.date));
                                    } catch (err) {
                                      alert(err?.response?.data?.message || 'Failed to delete event');
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Child Details */}
        <div className="card full-width">
          <h3>View Child Details</h3>
          <div className="actions" style={{ gap: 8 }}>
            <input
              type="text"
              placeholder="Enter Child ID"
              value={childIdInput}
              onChange={(e) => setChildIdInput(e.target.value)}
              style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd', flex: 1, minWidth: 220 }}
            />
            <button className="btn" type="button" disabled={childLoading} onClick={lookupChild}>
              {childLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {childError && <div className="form-error" style={{ marginTop: 10 }}>{childError}</div>}
          {childDetails && !editing && (
            <div className="table-wrap" style={{ marginTop: 10 }}>
              <table className="table">
                <tbody>
                  <tr><th>Child ID</th><td>{childDetails.childId}</td></tr>
                  <tr><th>Name</th><td>{childDetails.name}</td></tr>
                  <tr><th>Age</th><td>{childDetails.age}</td></tr>
                  <tr><th>Gender</th><td>{childDetails.gender}</td></tr>
                  <tr><th>Parent</th><td>{childDetails.parent}</td></tr>
                  <tr><th>Health Notes</th><td>{childDetails.healthNotes || '-'}</td></tr>
                  <tr>
                    <th
                      colSpan="2"
                      style={{
                        background: '#eef2ff',
                        color: '#1e3a8a',
                        textAlign: 'left',
                        fontWeight: 700,
                        padding: '8px 12px',
                        borderTop: '1px solid #dbeafe'
                      }}
                    >
                      Basic Daily Routine
                    </th>
                  </tr>
                  <tr><th>Check-in Time</th><td>{childDetails.checkInTime || '-'}</td></tr>
                  <tr><th>Check-out Time</th><td>{childDetails.checkOutTime || '-'}</td></tr>
                  <tr><th>Meal Updates</th><td>{childDetails.meals || '-'}</td></tr>
                  <tr><th>Nap Times</th><td>{childDetails.napTimes || '-'}</td></tr>
                  <tr>
                    <th
                      colSpan="2"
                      style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        textAlign: 'left',
                        fontWeight: 700,
                        padding: '8px 12px',
                        borderTop: '1px solid #fecaca'
                      }}
                    >
                      Health & Safety
                    </th>
                  </tr>
                  <tr><th>Health Status</th><td>{childDetails.healthStatus || '-'}</td></tr>
                  <tr><th>Accident/Incident Reports</th><td>{childDetails.incidents || '-'}</td></tr>
                  <tr><th>Medication Updates</th><td>{childDetails.medication || '-'}</td></tr>
                  <tr>
                    <th
                      colSpan="2"
                      style={{
                        background: '#ecfeff',
                        color: '#155e75',
                        textAlign: 'left',
                        fontWeight: 700,
                        padding: '8px 12px',
                        borderTop: '1px solid #a5f3fc'
                      }}
                    >
                      Behavior & Social Updates
                    </th>
                  </tr>
                  <tr><th>Mood & Behavior</th><td>{childDetails.moodBehavior || '-'}</td></tr>
                  <tr><th>Interaction with Other Kids</th><td>{childDetails.interactions || '-'}</td></tr>
                  <tr><th>Approved By</th><td>{childDetails.approvedBy ? (childDetails.approvedBy.name || childDetails.approvedBy.username || childDetails.approvedBy._id) : '-'}</td></tr>
                  <tr><th>Created</th><td>{new Date(childDetails.createdAt).toLocaleString()}</td></tr>
                </tbody>
              </table>
              <div className="actions" style={{ marginTop: 10 }}>
                <button className="btn" type="button" onClick={() => setEditing(true)}>Edit</button>
              </div>
            </div>
          )}
          {childDetails && editing && (
            <form
              className="fm-form"
              style={{ marginTop: 10 }}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await axios.put(`http://localhost:5000/children/${encodeURIComponent(childDetails.childId)}`, {
                    name: editForm.name,
                    age: editForm.age,
                    gender: editForm.gender,
                    parent: editForm.parent,
                    healthNotes: editForm.healthNotes,
                    checkInTime: editForm.checkInTime,
                    checkOutTime: editForm.checkOutTime,
                    meals: editForm.meals,
                    napTimes: editForm.napTimes,
                    healthStatus: editForm.healthStatus,
                    incidents: editForm.incidents,
                    medication: editForm.medication,
                    moodBehavior: editForm.moodBehavior,
                    interactions: editForm.interactions,
                  });
                  if (res.data?.success) {
                    setChildDetails(res.data.data);
                    setEditing(false);
                    alert('Child details updated');
                  } else {
                    alert(res.data?.message || 'Failed to update');
                  }
                } catch (err) {
                  alert(err?.response?.data?.message || 'Failed to update');
                }
              }}
            >
              <div className="row">
                <div className="col">
                  <label>Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="col">
                  <label>Age</label>
                  <input type="text" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
                </div>
                <div className="col">
                  <label>Gender</label>
                  <input type="text" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} />
                </div>
                <div className="col">
                  <label>Parent</label>
                  <input type="text" value={editForm.parent} onChange={(e) => setEditForm({ ...editForm, parent: e.target.value })} />
                </div>
                <div className="col">
                  <label>Health Notes</label>
                  <input type="text" value={editForm.healthNotes} onChange={(e) => setEditForm({ ...editForm, healthNotes: e.target.value })} />
                </div>
                <div className="col">
                  <label>Check-in Time</label>
                  <input type="text" placeholder="e.g., 08:45 AM" value={editForm.checkInTime} onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })} />
                </div>
                <div className="col">
                  <label>Check-out Time</label>
                  <input type="text" placeholder="e.g., 04:30 PM" value={editForm.checkOutTime} onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })} />
                </div>
                <div className="col">
                  <label>Meal Updates</label>
                  <input type="text" placeholder="e.g., Breakfast: cereal; Lunch: pasta" value={editForm.meals} onChange={(e) => setEditForm({ ...editForm, meals: e.target.value })} />
                </div>
                <div className="col">
                  <label>Nap Times</label>
                  <input type="text" placeholder="e.g., 1:00 PM - 2:00 PM" value={editForm.napTimes} onChange={(e) => setEditForm({ ...editForm, napTimes: e.target.value })} />
                </div>
                <div className="col">
                  <label>Health Status</label>
                  <input type="text" placeholder="e.g., Good; Mild cough" value={editForm.healthStatus} onChange={(e) => setEditForm({ ...editForm, healthStatus: e.target.value })} />
                </div>
                <div className="col">
                  <label>Accident/Incident Reports</label>
                  <input type="text" placeholder="e.g., Minor fall at 10:15 AM" value={editForm.incidents} onChange={(e) => setEditForm({ ...editForm, incidents: e.target.value })} />
                </div>
                <div className="col">
                  <label>Medication Updates</label>
                  <input type="text" placeholder="e.g., 5ml cough syrup at 2 PM" value={editForm.medication} onChange={(e) => setEditForm({ ...editForm, medication: e.target.value })} />
                </div>
                <div className="col">
                  <label>Mood & Behavior</label>
                  <input type="text" placeholder="e.g., Cheerful; cooperative" value={editForm.moodBehavior} onChange={(e) => setEditForm({ ...editForm, moodBehavior: e.target.value })} />
                </div>
                <div className="col">
                  <label>Interaction with Other Kids</label>
                  <input type="text" placeholder="e.g., Played well with Sam and Mia" value={editForm.interactions} onChange={(e) => setEditForm({ ...editForm, interactions: e.target.value })} />
                </div>
              </div>
              <div className="actions" style={{ marginTop: 10 }}>
                <button className="btn" type="submit">Save</button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
              </div>
            )}

            {/* Calendar Section */}
            {activeSection === 'calendar' && (
              <div>
                {/* Add Calendar Event */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Add Calendar Event</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setEvtError('');
                      setEvtSuccess('');
                      if (!eventForm.title.trim() || !eventForm.date) {
                        setEvtError('Title and Date are required');
                        return;
                      }
                      setEvtSubmitting(true);
                      try {
                        const payload = {
                          title: eventForm.title.trim(),
                          date: eventForm.date,
                          description: eventForm.description?.trim?.() || '',
                          childId: eventForm.childId?.trim?.() || undefined,
                          createdBy: staff?._id,
                        };
                        const res = await axios.post('http://localhost:5000/calendar/events', payload);
                        if (res.data?.success) {
                          setEvtSuccess('Event created');
                          setEventForm({ title: '', date: '', description: '', childId: '' });
                          await fetchEventsForMonth(new Date(payload.date));
                        } else {
                          setEvtError(res.data?.message || 'Failed to create event');
                        }
                      } catch (err) {
                        setEvtError(err?.response?.data?.message || 'Failed to create event');
                      } finally {
                        setEvtSubmitting(false);
                      }
                    }}
                  >
                    {evtError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{evtError}</div>}
                    {evtSuccess && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{evtSuccess}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                        <input
                          type="text"
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          placeholder="Event title"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
                        <input
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                        <input
                          type="text"
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          placeholder="Optional details"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Child ID (optional)</label>
                        <input
                          type="text"
                          value={eventForm.childId}
                          onChange={(e) => setEventForm({ ...eventForm, childId: e.target.value })}
                          placeholder="Link to a child"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={evtSubmitting}
                      style={{
                        background: evtSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '500',
                        marginTop: '1rem',
                        cursor: evtSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {evtSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Children Section */}
            {activeSection === 'children' && (
              <div>
                {/* View Child Details */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>View Child Details</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Enter Child ID"
                      value={childIdInput}
                      onChange={(e) => setChildIdInput(e.target.value)}
                      style={{ 
                        flex: 1, 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        border: '1px solid #d1d5db' 
                      }}
                    />
                    <button 
                      onClick={lookupChild} 
                      disabled={childLoading}
                      style={{
                        background: childLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '500',
                        cursor: childLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {childLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  {childError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{childError}</div>}
                  {childDetails && (
                    <div style={{ 
                      background: '#f8fafc', 
                      borderRadius: '12px', 
                      padding: '1rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <p><strong>Child ID:</strong> {childDetails.childId}</p>
                      <p><strong>Name:</strong> {childDetails.name}</p>
                      <p><strong>Age:</strong> {childDetails.age}</p>
                      <p><strong>Gender:</strong> {childDetails.gender}</p>
                      <p><strong>Parent:</strong> {childDetails.parent}</p>
                      <p><strong>Health Notes:</strong> {childDetails.healthNotes || '-'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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

export default StaffDashboard;
