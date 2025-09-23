import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  // Finance managers state
  const [fmList, setFmList] = useState([]);
  const [fmLoading, setFmLoading] = useState(false);
  const [fmError, setFmError] = useState('');
  const [fmForm, setFmForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [fmSubmitting, setFmSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/dashboard');
        setData(res.data?.data || null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch finance managers
  const fetchManagers = async () => {
    try {
      setFmLoading(true);
      setFmError('');
      const res = await axios.get('http://localhost:5000/admin/finance-managers');
      setFmList(res.data?.data || []);
    } catch (err) {
      setFmError(err?.response?.data?.message || 'Failed to load finance managers');
    } finally {
      setFmLoading(false);
    }
  };

  // Load managers when Finance tab becomes active
  useEffect(() => {
    if (activeTab === 'finance') {
      fetchManagers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const admin = JSON.parse(localStorage.getItem('admin') || 'null');

  const TabButton = ({ id, label }) => (
    <button
      className={`tab-btn ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage different areas using the tabs below</p>
        </div>
        {admin && (
          <div className="admin-profile">
            <span className="role">{admin.role}</span>
            <span className="username">{admin.username}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <TabButton id="overview" label="Overview" />
        <TabButton id="finance" label="Finance Manager" />
        <TabButton id="teacher" label="Teacher" />
        <TabButton id="staff" label="Staff" />
        <TabButton id="inventory" label="Inventory Manager" />
      </div>

      {/* Tab Panels */}
      <div className="tab-panels">
        {activeTab === 'overview' && (
          <div className="panel">
            {loading && <div className="card">Loading...</div>}
            {error && <div className="card error">{error}</div>}
            {!loading && !error && (
              <div className="grid">
                <div className="card stat">
                  <h3>Total Users</h3>
                  <p>{data?.totalUsers ?? '-'}</p>
                </div>
                <div className="card stat">
                  <h3>Total Transactions</h3>
                  <p>{data?.totalTransactions ?? '-'}</p>
                </div>
                <div className="card stat">
                  <h3>Total Revenue</h3>
                  <p>{data?.totalRevenue ?? '-'}</p>
                </div>
                <div className="card">
                  <h3>Recent Activities</h3>
                  {data?.recentActivities?.length ? (
                    <ul>
                      {data.recentActivities.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No recent activities</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="panel">
            {/* Create Finance Manager */}
            <div className="card">
              <h3>Add Finance Manager</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFmError('');
                  if (!fmForm.name.trim() || !fmForm.email.trim() || !fmForm.username.trim() || !fmForm.password) {
                    setFmError('Name, Email, Username and Password are required');
                    return;
                  }
                  setFmSubmitting(true);
                  try {
                    const res = await axios.post('http://localhost:5000/admin/finance-managers', {
                      name: fmForm.name.trim(),
                      email: fmForm.email.trim().toLowerCase(),
                      phone: fmForm.phone.trim(),
                      username: fmForm.username.trim(),
                      password: fmForm.password,
                    });
                    if (res.data?.success) {
                      setFmForm({ name: '', email: '', phone: '', username: '', password: '' });
                      // refresh list
                      await fetchManagers();
                      alert('Finance manager added');
                    } else {
                      setFmError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setFmError(err?.response?.data?.message || 'Failed to create');
                  } finally {
                    setFmSubmitting(false);
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={fmForm.name}
                      onChange={(e) => setFmForm({ ...fmForm, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={fmForm.email}
                      onChange={(e) => setFmForm({ ...fmForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={fmForm.username}
                      onChange={(e) => setFmForm({ ...fmForm, username: e.target.value })}
                      placeholder="Unique username"
                    />
                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={fmForm.password}
                      onChange={(e) => setFmForm({ ...fmForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={fmForm.phone}
                      onChange={(e) => setFmForm({ ...fmForm, phone: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                {fmError && <div className="form-error">{fmError}</div>}
                <button className="btn" type="submit" disabled={fmSubmitting}>
                  {fmSubmitting ? 'Adding...' : 'Add Manager'}
                </button>
              </form>
            </div>

            {/* List Finance Managers */}
            <div className="card">
              <div className="list-header">
                <h3>Finance Managers</h3>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={async () => {
                    await fetchManagers();
                  }}
                >
                  Refresh
                </button>
              </div>
              {fmLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fmList.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center' }}>No finance managers yet</td>
                        </tr>
                      ) : (
                        fmList.map((m) => (
                          <tr key={m._id}>
                            {editingId === m._id ? (
                              <>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  />
                                </td>
                                <td className="actions-cell">
                                  <input
                                    className="table-input"
                                    type="password"
                                    placeholder="New password (optional)"
                                    value={editForm.password || ''}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                  />
                                  <div className="row-actions">
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={async () => {
                                        // Basic validation
                                        if (!editForm.name.trim() || !editForm.email.trim() || !editForm.username.trim()) {
                                          alert('Name, Email, and Username are required');
                                          return;
                                        }
                                        try {
                                          await axios.put(`http://localhost:5000/admin/finance-managers/${m._id}`, {
                                            name: editForm.name.trim(),
                                            email: editForm.email.trim().toLowerCase(),
                                            phone: editForm.phone?.trim?.() || '',
                                            username: editForm.username.trim(),
                                            password: editForm.password || undefined,
                                          });
                                          setEditingId(null);
                                          setEditForm({ name: '', email: '', phone: '', username: '', password: '' });
                                          await fetchManagers();
                                        } catch (err) {
                                          alert(err?.response?.data?.message || 'Failed to update');
                                        }
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setEditingId(null);
                                        setEditForm({ name: '', email: '', phone: '', username: '', password: '' });
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{m.name}</td>
                                <td>{m.username}</td>
                                <td>{m.email}</td>
                                <td>{m.phone || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setEditingId(m._id);
                                        setEditForm({ name: m.name || '', email: m.email || '', phone: m.phone || '', username: m.username || '', password: '' });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm('Delete this manager?')) return;
                                        try {
                                          await axios.delete(`http://localhost:5000/admin/finance-managers/${m._id}`);
                                          await fetchManagers();
                                        } catch (err) {
                                          alert('Failed to delete');
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

            {/* Quick links */}
            <div className="grid">
              <div className="card">
                <h3>Quick Links</h3>
                <p>Access financial features like transactions, salaries, and reports.</p>
                <div className="actions">
                  <Link className="btn" to="/mainfina">Open Finance</Link>
                  <Link className="btn" to="/SalaryDetails">Salaries</Link>
                  <Link className="btn" to="/BillDetails">Bills</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teacher' && (
          <div className="panel">
            <div className="card">
              <h3>Teacher Management</h3>
              <p>Coming soon: manage teachers, schedules, and classes.</p>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="panel">
            <div className="card">
              <h3>Staff Management</h3>
              <p>Coming soon: manage staff records, attendance, and payroll.</p>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="panel">
            <div className="card">
              <h3>Inventory Manager</h3>
              <p>Coming soon: track supplies, items, and inventory levels.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
