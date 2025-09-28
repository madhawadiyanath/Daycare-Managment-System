import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LearningActivities() {
  const parentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();
  const [childId, setChildId] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Require parent login to access Learning & Assessment page
    if (!parentUser) {
      navigate('/login');
      return;
    }
    // optionally prefill childId if your parent profile stores a default child
  }, []);

  const fetchActivities = async () => {
    setError('');
    setList([]);
    const id = childId.trim();
    if (!id) { setError('Please enter a Child ID'); return; }
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/learning-activities/by-child/${encodeURIComponent(id)}`);
      if (res.data?.success) {
        setList(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to fetch learning activities');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch learning activities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="dashboard" style={{ maxWidth: 1000, margin: '40px auto', padding: '0 16px' }}>
        <h1 className="title">Learning & Assessment</h1>
        {!parentUser && (
          <div className="form-error" style={{ marginTop: 8 }}>Please login as a parent to view learning activities.</div>
        )}
        <div className="card full-width" style={{ marginTop: 16 }}>
          <h3>View Learning Activities</h3>
          <div className="actions" style={{ gap: 8 }}>
            <input
              type="text"
              placeholder="Enter Child ID"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd', flex: 1, minWidth: 220 }}
            />
            <button className="btn" type="button" disabled={loading} onClick={fetchActivities}>
              {loading ? 'Loading...' : 'Get Activities'}
            </button>
          </div>
          {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      {loading ? 'Loading...' : 'No activities to show'}
                    </td>
                  </tr>
                ) : (
                  list.map((a) => (
                    <tr key={a._id}>
                      <td>{a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-')}</td>
                      <td>{a.title || '-'}</td>
                      <td>{a.description || '-'}</td>
                      <td>{a.recordedBy || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
