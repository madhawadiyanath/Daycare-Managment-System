import React from 'react';
import { Link } from 'react-router-dom';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || 'null');
  const [searchId, setSearchId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [child, setChild] = React.useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setChild(null);
    const id = String(searchId || '').trim();
    if (!id) {
      setError('Please enter a child ID');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/children/${encodeURIComponent(id)}`);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!res.ok) {
        if (isJson) {
          const body = await res.json();
          throw new Error(body?.message || `Request failed with status ${res.status}`);
        }
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = isJson ? await res.json() : null;
      const payload = data?.data || data || null;
      if (!payload) {
        setError('Child not found');
      } else {
        setChild(payload);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch child');
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setChild(null);
    setError('');
    setSearchId('');
  };

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
        <div className="card">
          <h3>Search Child by ID</h3>
          <form className="actions" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter Child ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            {(child || error) && (
              <button type="button" className="btn secondary" onClick={clearResult} disabled={loading}>
                Clear
              </button>
            )}
          </form>
          {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
          {child && (
            <div className="result" style={{ marginTop: 16 }}>
              <h4>Child Details</h4>
              <div className="details">
                {child.childId && <p><strong>Child ID:</strong> {child.childId}</p>}
                {child.name && <p><strong>Name:</strong> {child.name}</p>}
                {typeof child.age !== 'undefined' && <p><strong>Age:</strong> {child.age}</p>}
                {child.gender && <p><strong>Gender:</strong> {child.gender}</p>}
                {child.parent && <p><strong>Parent:</strong> {typeof child.parent === 'string' ? child.parent : (child.parent?.name || '')}</p>}
                {child.healthNotes && <p><strong>Health Notes:</strong> {child.healthNotes}</p>}
                {child.approvedBy && (
                  <p><strong>Approved By:</strong> {child.approvedBy?.name || child.approvedBy?.username || child.approvedBy?._id}</p>
                )}
                {child.createdAt && <p><strong>Created:</strong> {new Date(child.createdAt).toLocaleString()}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
