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

  // Teachers state
  const [tList, setTList] = useState([]);
  const [tLoading, setTLoading] = useState(false);
  const [tError, setTError] = useState('');
  const [tForm, setTForm] = useState({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
  const [tEditingId, setTEditingId] = useState(null);
  const [tEditForm, setTEditForm] = useState({ name: '', email: '', phone: '', subject: '', username: '', password: '' });

  // Staff state
  const [sList, setSList] = useState([]);
  const [sLoading, setSLoading] = useState(false);
  const [sError, setSError] = useState('');
  const [sForm, setSForm] = useState({ name: '', email: '', phone: '', role: '', username: '', password: '' });
  const [sEditingId, setSEditingId] = useState(null);
  const [sEditForm, setSEditForm] = useState({ name: '', email: '', phone: '', role: '', username: '', password: '' });

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

  // Fetch staff
  async function fetchStaff() {
    try {
      setSLoading(true);
      setSError('');
      const res = await axios.get('http://localhost:5000/admin/staff');
      setSList(res.data?.data || []);
    } catch (err) {
      setSError(err?.response?.data?.message || 'Failed to load staff');
    } finally {
      setSLoading(false);
    }
  }

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

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setTLoading(true);
      setTError('');
      const res = await axios.get('http://localhost:5000/admin/teachers');
      setTList(res.data?.data || []);
    } catch (err) {
      setTError(err?.response?.data?.message || 'Failed to load teachers');
    } finally {
      setTLoading(false);
    }
  };

  // Load managers when Finance tab becomes active
  useEffect(() => {
    if (activeTab === 'finance') {
      fetchManagers();
    }
    if (activeTab === 'teacher') {
      fetchTeachers();
    }
    if (activeTab === 'staff') {
      fetchStaff();
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
            {/* Add Teacher */}
            <div className="card">
              <h3>Add Teacher</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setTError('');
                  if (!tForm.name.trim() || !tForm.email.trim() || !tForm.username.trim() || !tForm.password) {
                    setTError('Name, Email, Username and Password are required');
                    return;
                  }
                  try {
                    const res = await axios.post('http://localhost:5000/admin/teachers', {
                      name: tForm.name.trim(),
                      email: tForm.email.trim().toLowerCase(),
                      phone: tForm.phone.trim(),
                      subject: tForm.subject.trim(),
                      username: tForm.username.trim(),
                      password: tForm.password,
                    });
                    if (res.data?.success) {
                      setTForm({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
                      await fetchTeachers();
                    } else {
                      setTError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setTError(err?.response?.data?.message || 'Failed to create');
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={tForm.name}
                      onChange={(e) => setTForm({ ...tForm, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={tForm.email}
                      onChange={(e) => setTForm({ ...tForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={tForm.username}
                      onChange={(e) => setTForm({ ...tForm, username: e.target.value })}
                      placeholder="Unique username"
                    />
                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={tForm.password}
                      onChange={(e) => setTForm({ ...tForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={tForm.phone}
                      onChange={(e) => setTForm({ ...tForm, phone: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={tForm.subject}
                      onChange={(e) => setTForm({ ...tForm, subject: e.target.value })}
                      placeholder="e.g., Math, Science"
                    />
                  </div>
                </div>
                {tError && <div className="form-error">{tError}</div>}
                <button className="btn" type="submit">Add Teacher</button>
              </form>
            </div>

            {/* List Teachers */}
            <div className="card">
              <div className="list-header">
                <h3>Teachers</h3>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={async () => { await fetchTeachers(); }}
                >
                  Refresh
                </button>
              </div>
              {tLoading ? (
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
                        <th>Subject</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tList.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>No teachers yet</td>
                        </tr>
                      ) : (
                        tList.map((t) => (
                          <tr key={t._id}>
                            {tEditingId === t._id ? (
                              <>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.name}
                                    onChange={(e) => setTEditForm({ ...tEditForm, name: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.username}
                                    onChange={(e) => setTEditForm({ ...tEditForm, username: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="email"
                                    value={tEditForm.email}
                                    onChange={(e) => setTEditForm({ ...tEditForm, email: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.phone || ''}
                                    onChange={(e) => setTEditForm({ ...tEditForm, phone: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.subject || ''}
                                    onChange={(e) => setTEditForm({ ...tEditForm, subject: e.target.value })}
                                  />
                                </td>
                                <td className="actions-cell">
                                  <input
                                    className="table-input"
                                    type="password"
                                    placeholder="New password (optional)"
                                    value={tEditForm.password || ''}
                                    onChange={(e) => setTEditForm({ ...tEditForm, password: e.target.value })}
                                  />
                                  <div className="row-actions">
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={async () => {
                                        if (!tEditForm.name.trim() || !tEditForm.email.trim() || !tEditForm.username.trim()) {
                                          alert('Name, Email, and Username are required');
                                          return;
                                        }
                                        try {
                                          await axios.put(`http://localhost:5000/admin/teachers/${t._id}`, {
                                            name: tEditForm.name.trim(),
                                            email: tEditForm.email.trim().toLowerCase(),
                                            phone: tEditForm.phone?.trim?.() || '',
                                            subject: tEditForm.subject?.trim?.() || '',
                                            username: tEditForm.username.trim(),
                                            password: tEditForm.password || undefined,
                                          });
                                          setTEditingId(null);
                                          setTEditForm({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
                                          await fetchTeachers();
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
                                        setTEditingId(null);
                                        setTEditForm({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{t.name}</td>
                                <td>{t.username}</td>
                                <td>{t.email}</td>
                                <td>{t.phone || '-'}</td>
                                <td>{t.subject || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setTEditingId(t._id);
                                        setTEditForm({ name: t.name || '', email: t.email || '', phone: t.phone || '', subject: t.subject || '', username: t.username || '', password: '' });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm('Delete this teacher?')) return;
                                        try {
                                          await axios.delete(`http://localhost:5000/admin/teachers/${t._id}`);
                                          await fetchTeachers();
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
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="panel">
            {/* Add Staff */}
            <div className="card">
              <h3>Add Staff</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSError('');
                  if (!sForm.name.trim() || !sForm.email.trim() || !sForm.username.trim() || !sForm.password) {
                    setSError('Name, Email, Username and Password are required');
                    return;
                  }
                  try {
                    const res = await axios.post('http://localhost:5000/admin/staff', {
                      name: sForm.name.trim(),
                      email: sForm.email.trim().toLowerCase(),
                      phone: sForm.phone.trim(),
                      role: sForm.role.trim(),
                      username: sForm.username.trim(),
                      password: sForm.password,
                    });
                    if (res.data?.success) {
                      setSForm({ name: '', email: '', phone: '', role: '', username: '', password: '' });
                      await fetchStaff();
                    } else {
                      setSError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setSError(err?.response?.data?.message || 'Failed to create');
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={sForm.name}
                      onChange={(e) => setSForm({ ...sForm, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={sForm.email}
                      onChange={(e) => setSForm({ ...sForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={sForm.username}
                      onChange={(e) => setSForm({ ...sForm, username: e.target.value })}
                      placeholder="Unique username"
                    />
                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={sForm.password}
                      onChange={(e) => setSForm({ ...sForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={sForm.phone}
                      onChange={(e) => setSForm({ ...sForm, phone: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col">
                    <label>Role</label>
                    <input
                      type="text"
                      value={sForm.role}
                      onChange={(e) => setSForm({ ...sForm, role: e.target.value })}
                      placeholder="e.g., Assistant, Cleaner"
                    />
                  </div>
                </div>
                {sError && <div className="form-error">{sError}</div>}
                <button className="btn" type="submit">Add Staff</button>
              </form>
            </div>

            {/* List Staff */}
            <div className="card">
              <div className="list-header">
                <h3>Staff</h3>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={async () => { await fetchStaff(); }}
                >
                  Refresh
                </button>
              </div>
              {sLoading ? (
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
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sList.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>No staff yet</td>
                        </tr>
                      ) : (
                        sList.map((s) => (
                          <tr key={s._id}>
                            {sEditingId === s._id ? (
                              <>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.name} onChange={(e) => setSEditForm({ ...sEditForm, name: e.target.value })} />
                                </td>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.username} onChange={(e) => setSEditForm({ ...sEditForm, username: e.target.value })} />
                                </td>
                                <td>
                                  <input className="table-input" type="email" value={sEditForm.email} onChange={(e) => setSEditForm({ ...sEditForm, email: e.target.value })} />
                                </td>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.phone || ''} onChange={(e) => setSEditForm({ ...sEditForm, phone: e.target.value })} />
                                </td>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.role || ''} onChange={(e) => setSEditForm({ ...sEditForm, role: e.target.value })} />
                                </td>
                                <td className="actions-cell">
                                  <input className="table-input" type="password" placeholder="New password (optional)" value={sEditForm.password || ''} onChange={(e) => setSEditForm({ ...sEditForm, password: e.target.value })} />
                                  <div className="row-actions">
                                    <button className="btn" type="button" onClick={async () => {
                                      if (!sEditForm.name.trim() || !sEditForm.email.trim() || !sEditForm.username.trim()) { alert('Name, Email, and Username are required'); return; }
                                      try {
                                        await axios.put(`http://localhost:5000/admin/staff/${s._id}`, {
                                          name: sEditForm.name.trim(),
                                          email: sEditForm.email.trim().toLowerCase(),
                                          phone: sEditForm.phone?.trim?.() || '',
                                          role: sEditForm.role?.trim?.() || '',
                                          username: sEditForm.username.trim(),
                                          password: sEditForm.password || undefined,
                                        });
                                        setSEditingId(null);
                                        setSEditForm({ name: '', email: '', phone: '', role: '', username: '', password: '' });
                                        await fetchStaff();
                                      } catch (err) {
                                        alert(err?.response?.data?.message || 'Failed to update');
                                      }
                                    }}>Save</button>
                                    <button className="btn btn-secondary" type="button" onClick={() => { setSEditingId(null); setSEditForm({ name: '', email: '', phone: '', role: '', username: '', password: '' }); }}>Cancel</button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{s.name}</td>
                                <td>{s.username}</td>
                                <td>{s.email}</td>
                                <td>{s.phone || '-'}</td>
                                <td>{s.role || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button className="btn btn-secondary" type="button" onClick={() => { setSEditingId(s._id); setSEditForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', role: s.role || '', username: s.username || '', password: '' }); }}>Edit</button>
                                    <button className="btn btn-danger" type="button" onClick={async () => {
                                      if (!window.confirm('Delete this staff member?')) return;
                                      try {
                                        await axios.delete(`http://localhost:5000/admin/staff/${s._id}`);
                                        await fetchStaff();
                                      } catch (err) {
                                        alert('Failed to delete');
                                      }
                                    }}>Delete</button>
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
