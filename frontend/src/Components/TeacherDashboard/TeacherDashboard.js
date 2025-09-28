import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TeacherDashboard.css';
import axios from 'axios';

function TeacherDashboard() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || 'null');
  const [laForm, setLaForm] = useState({ childId: '', childName: '', title: '', date: '', description: '' });
  const [laSubmitting, setLaSubmitting] = useState(false);
  const [laError, setLaError] = useState('');
  const [laSuccess, setLaSuccess] = useState('');
  // Child details lookup state
  const [childIdInput, setChildIdInput] = useState('');
  const [childLoading, setChildLoading] = useState(false);
  const [childError, setChildError] = useState('');
  const [childDetails, setChildDetails] = useState(null);
  // Learning activities list state
  const [laChildId, setLaChildId] = useState('');
  const [laList, setLaList] = useState([]);
  const [laLoadingList, setLaLoadingList] = useState(false);
  const [laListError, setLaListError] = useState('');

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

        {/* Learning Activities Form */}
        <div className="card full-width">
          <h3>Add Learning Activity</h3>
          <p className="subtitle" style={{ marginTop: -6 }}>Record a learning activity for a child.</p>
          {laError && <div className="form-error">{laError}</div>}
          {laSuccess && <div className="form-success">{laSuccess}</div>}
          <form
            className="fm-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setLaError('');
              setLaSuccess('');
              const { childId, childName, title, date, description } = laForm;
              if (!childId.trim() || !childName.trim()) {
                setLaError('Child ID and Child Name are required');
                return;
              }
              try {
                setLaSubmitting(true);
                await axios.post('http://localhost:5000/learning-activities', {
                  childId: childId.trim(),
                  childName: childName.trim(),
                  title: title.trim() || undefined,
                  date: date || new Date().toISOString().slice(0, 10),
                  description: description.trim() || undefined,
                  recordedBy: teacher?.username || 'teacher',
                });
                setLaSuccess('Learning activity recorded successfully');
                setLaForm({ childId: '', childName: '', title: '', date: '', description: '' });
              } catch (err) {
                setLaError(err?.response?.data?.message || 'Failed to record learning activity');
              } finally {
                setLaSubmitting(false);
              }
            }}
          >
            <div className="row">
              <div className="col">
                <label>Child ID</label>
                <input
                  type="text"
                  value={laForm.childId}
                  onChange={(e) => setLaForm({ ...laForm, childId: e.target.value })}
                  placeholder="Enter Child ID"
                  required
                />
              </div>
              <div className="col">
                <label>Child Name</label>
                <input
                  type="text"
                  value={laForm.childName}
                  onChange={(e) => setLaForm({ ...laForm, childName: e.target.value })}
                  placeholder="Enter Child Name"
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label>Activity Title (optional)</label>
                <input
                  type="text"
                  value={laForm.title}
                  onChange={(e) => setLaForm({ ...laForm, title: e.target.value })}
                  placeholder="e.g., Shapes & Colors"
                />
              </div>
              <div className="col">
                <label>Date</label>
                <input
                  type="date"
                  value={laForm.date}
                  onChange={(e) => setLaForm({ ...laForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="row">
              <div className="col full-width">
                <label>Description (optional)</label>
                <textarea
                  rows="3"
                  value={laForm.description}
                  onChange={(e) => setLaForm({ ...laForm, description: e.target.value })}
                  placeholder="Briefly describe the learning activity"
                />
              </div>
            </div>
            <div className="actions" style={{ marginTop: 10 }}>
              <button className="btn" type="submit" disabled={laSubmitting}>
                {laSubmitting ? 'Saving...' : 'Save Activity'}
              </button>
            </div>
          </form>
        </div>

        {/* View Child Details by ID */}
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
            <button
              className="btn"
              type="button"
              disabled={childLoading}
              onClick={async () => {
                setChildError('');
                setChildDetails(null);
                const id = childIdInput.trim();
                if (!id) { setChildError('Please enter a Child ID'); return; }
                try {
                  setChildLoading(true);
                  const res = await axios.get(`http://localhost:5000/children/${encodeURIComponent(id)}`);
                  if (res.data?.success) {
                    setChildDetails(res.data.data);
                  } else {
                    setChildError(res.data?.message || 'Child not found');
                  }
                } catch (err) {
                  setChildError(err?.response?.data?.message || 'Child not found');
                } finally {
                  setChildLoading(false);
                }
              }}
            >
              {childLoading ? 'Loading...' : 'Get Details'}
            </button>
          </div>
          {childError && <div className="form-error" style={{ marginTop: 10 }}>{childError}</div>}
          {childDetails && (
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table className="table">
                <tbody>
                  <tr><th>Child ID</th><td>{childDetails.childId}</td></tr>
                  <tr><th>Name</th><td>{childDetails.name}</td></tr>
                  <tr><th>Age</th><td>{childDetails.age}</td></tr>
                  <tr><th>Gender</th><td>{childDetails.gender}</td></tr>
                  <tr><th>Parent</th><td>{childDetails.parent}</td></tr>
                  <tr><th>Health Notes</th><td>{childDetails.healthNotes || '-'}</td></tr>
                  <tr><th>Check-in Time</th><td>{childDetails.checkInTime || '-'}</td></tr>
                  <tr><th>Check-out Time</th><td>{childDetails.checkOutTime || '-'}</td></tr>
                  <tr><th>Meal Updates</th><td>{childDetails.meals || '-'}</td></tr>
                  <tr><th>Nap Times</th><td>{childDetails.napTimes || '-'}</td></tr>
                  <tr><th>Health Status</th><td>{childDetails.healthStatus || '-'}</td></tr>
                  <tr><th>Accident/Incident Reports</th><td>{childDetails.incidents || '-'}</td></tr>
                  <tr><th>Medication Updates</th><td>{childDetails.medication || '-'}</td></tr>
                  <tr><th>Mood & Behavior</th><td>{childDetails.moodBehavior || '-'}</td></tr>
                  <tr><th>Interaction with Other Kids</th><td>{childDetails.interactions || '-'}</td></tr>
                  <tr><th>Approved By</th><td>{childDetails.approvedBy ? (childDetails.approvedBy.name || childDetails.approvedBy.username || childDetails.approvedBy._id) : '-'}</td></tr>
                  <tr><th>Created</th><td>{childDetails.createdAt ? new Date(childDetails.createdAt).toLocaleString() : '-'}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Learning Activities by Child ID */}
        <div className="card full-width">
          <h3>View Learning Activities</h3>
          <div className="actions" style={{ gap: 8 }}>
            <input
              type="text"
              placeholder="Enter Child ID"
              value={laChildId}
              onChange={(e) => setLaChildId(e.target.value)}
              style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd', flex: 1, minWidth: 220 }}
            />
            <button
              className="btn"
              type="button"
              disabled={laLoadingList}
              onClick={async () => {
                setLaListError('');
                setLaList([]);
                const id = laChildId.trim();
                if (!id) { setLaListError('Please enter a Child ID'); return; }
                try {
                  setLaLoadingList(true);
                  const res = await axios.get(`http://localhost:5000/learning-activities/by-child/${encodeURIComponent(id)}`);
                  if (res.data?.success) {
                    setLaList(res.data.data || []);
                  } else {
                    setLaListError(res.data?.message || 'Failed to fetch learning activities');
                  }
                } catch (err) {
                  setLaListError(err?.response?.data?.message || 'Failed to fetch learning activities');
                } finally {
                  setLaLoadingList(false);
                }
              }}
            >
              {laLoadingList ? 'Loading...' : 'Get Activities'}
            </button>
          </div>
          {laListError && <div className="form-error" style={{ marginTop: 10 }}>{laListError}</div>}
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
                {laList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      {laLoadingList ? 'Loading...' : 'No activities to show'}
                    </td>
                  </tr>
                ) : (
                  laList.map((a) => (
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

export default TeacherDashboard;
