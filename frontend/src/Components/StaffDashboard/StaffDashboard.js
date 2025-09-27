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
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: '', parent: '', healthNotes: '' });

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
          healthNotes: res.data.data.healthNotes || ''
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
        {/* Quick Links */}
        <div className="card">
          <h3>Quick Links</h3>
          <div className="actions">
            <Link to="/goHome" className="btn">Home</Link>
            <Link to="/ChildcareDashboard" className="btn">Childcare</Link>
          </div>
        </div>

        {/* Pending Child Requests */}
        <div className="card full-width">
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
              </div>
              <div className="actions" style={{ marginTop: 10 }}>
                <button className="btn" type="submit">Save</button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
