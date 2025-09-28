import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TeacherDashboard.css';
import axios from 'axios';

function TeacherDashboard() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || 'null');
  // Combined form state for both activity and progress
  const [combinedForm, setCombinedForm] = useState({
    childId: '',
    childName: '',
    title: '',
    date: '',
    description: '',
    activityType: 'general', // 'general' or 'progress_update'
    literacy: 0,
    mathematics: 0,
    socialSkills: 0,
    motorSkills: 0,
    creativity: 0,
    notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
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

        {/* Combined Learning Activity & Progress Form */}
        <div className="card full-width">
          <h3>Record Learning Activity & Progress</h3>
          <p className="subtitle" style={{ marginTop: -6 }}>Record learning activities and optionally track progress metrics in one form.</p>
          {formError && <div className="form-error">{formError}</div>}
          {formSuccess && <div className="form-success">{formSuccess}</div>}
          <form
            className="fm-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              setFormSuccess('');
              const { childId, childName, title, date, description, activityType, literacy, mathematics, socialSkills, motorSkills, creativity, notes } = combinedForm;
              
              if (!childId.trim() || !childName.trim()) {
                setFormError('Child ID and Child Name are required');
                return;
              }

              try {
                setFormSubmitting(true);
                
                const payload = {
                  childId: childId.trim(),
                  childName: childName.trim(),
                  title: title.trim() || (activityType === 'progress_update' ? 'Daily Progress Update' : undefined),
                  date: date || new Date().toISOString().slice(0, 10),
                  description: description.trim() || (activityType === 'progress_update' ? 'Progress metrics update' : undefined),
                  recordedBy: teacher?.username || 'teacher',
                  activityType: activityType,
                  notes: notes.trim() || undefined
                };

                // Add progress metrics if this is a progress update
                if (activityType === 'progress_update') {
                  payload.progressMetrics = {
                    literacy: parseInt(literacy) || 0,
                    mathematics: parseInt(mathematics) || 0,
                    socialSkills: parseInt(socialSkills) || 0,
                    motorSkills: parseInt(motorSkills) || 0,
                    creativity: parseInt(creativity) || 0
                  };
                }

                await axios.post('http://localhost:5000/learning-activities', payload);
                
                setFormSuccess(activityType === 'progress_update' ? 
                  'Activity and progress recorded successfully!' : 
                  'Learning activity recorded successfully!');
                
                setCombinedForm({
                  childId: '',
                  childName: '',
                  title: '',
                  date: '',
                  description: '',
                  activityType: 'general',
                  literacy: 0,
                  mathematics: 0,
                  socialSkills: 0,
                  motorSkills: 0,
                  creativity: 0,
                  notes: ''
                });
              } catch (err) {
                setFormError(err?.response?.data?.message || 'Failed to record activity');
              } finally {
                setFormSubmitting(false);
              }
            }}
          >
            {/* Basic Information */}
            <div className="row">
              <div className="col">
                <label>Child ID</label>
                <input
                  type="text"
                  value={combinedForm.childId}
                  onChange={(e) => setCombinedForm({ ...combinedForm, childId: e.target.value })}
                  placeholder="Enter Child ID"
                  required
                />
              </div>
              <div className="col">
                <label>Child Name</label>
                <input
                  type="text"
                  value={combinedForm.childName}
                  onChange={(e) => setCombinedForm({ ...combinedForm, childName: e.target.value })}
                  placeholder="Enter Child Name"
                  required
                />
              </div>
              <div className="col">
                <label>Date</label>
                <input
                  type="date"
                  value={combinedForm.date}
                  onChange={(e) => setCombinedForm({ ...combinedForm, date: e.target.value })}
                />
              </div>
            </div>

            {/* Activity Type Selection */}
            <div className="row">
              <div className="col">
                <label>Record Type</label>
                <select
                  value={combinedForm.activityType}
                  onChange={(e) => setCombinedForm({ ...combinedForm, activityType: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ced4da', width: '100%' }}
                >
                  <option value="general">General Learning Activity</option>
                  <option value="progress_update">Progress Update (with metrics)</option>
                </select>
              </div>
              <div className="col">
                <label>Activity Title {combinedForm.activityType === 'general' ? '(optional)' : '(auto-filled)'}</label>
                <input
                  type="text"
                  value={combinedForm.title}
                  onChange={(e) => setCombinedForm({ ...combinedForm, title: e.target.value })}
                  placeholder={combinedForm.activityType === 'general' ? "e.g., Shapes & Colors" : "Daily Progress Update"}
                  disabled={combinedForm.activityType === 'progress_update'}
                />
              </div>
            </div>

            <div className="row">
              <div className="col full-width">
                <label>Description {combinedForm.activityType === 'general' ? '(optional)' : '(auto-filled)'}</label>
                <textarea
                  rows="3"
                  value={combinedForm.description}
                  onChange={(e) => setCombinedForm({ ...combinedForm, description: e.target.value })}
                  placeholder={combinedForm.activityType === 'general' ? 
                    "Briefly describe the learning activity" : 
                    "Progress metrics update"}
                  disabled={combinedForm.activityType === 'progress_update'}
                />
              </div>
            </div>

            {/* Progress Metrics Section - Only show when activityType is 'progress_update' */}
            {combinedForm.activityType === 'progress_update' && (
              <div className="progress-section">
                <h4 style={{ marginBottom: 16 }}>Progress Metrics (0-100%)</h4>
                
                <div className="progress-item">
                  <label>Literacy: {combinedForm.literacy}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.literacy}
                    onChange={(e) => setCombinedForm({ ...combinedForm, literacy: e.target.value })}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <label>Mathematics: {combinedForm.mathematics}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.mathematics}
                    onChange={(e) => setCombinedForm({ ...combinedForm, mathematics: e.target.value })}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <label>Social Skills: {combinedForm.socialSkills}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.socialSkills}
                    onChange={(e) => setCombinedForm({ ...combinedForm, socialSkills: e.target.value })}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <label>Motor Skills: {combinedForm.motorSkills}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.motorSkills}
                    onChange={(e) => setCombinedForm({ ...combinedForm, motorSkills: e.target.value })}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <label>Creativity: {combinedForm.creativity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.creativity}
                    onChange={(e) => setCombinedForm({ ...combinedForm, creativity: e.target.value })}
                    className="progress-slider"
                  />
                </div>
              </div>
            )}
            
            {/* Notes Section */}
            <div className="row">
              <div className="col full-width">
                <label>
                  {combinedForm.activityType === 'progress_update' ? 
                    'Notes / Observations' : 
                    'Additional Notes (optional)'}
                </label>
                <textarea
                  rows="3"
                  value={combinedForm.notes}
                  onChange={(e) => setCombinedForm({ ...combinedForm, notes: e.target.value })}
                  placeholder={combinedForm.activityType === 'progress_update' ? 
                    "Record observations about the child's progress today" : 
                    "Any additional notes about this activity"}
                />
              </div>
            </div>
            
            <div className="actions" style={{ marginTop: 10 }}>
              <button 
                className={`btn ${combinedForm.activityType === 'progress_update' ? 'progress-btn' : ''}`} 
                type="submit" 
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Saving...' : 
                  combinedForm.activityType === 'progress_update' ? 
                    'Save Activity & Progress' : 
                    'Save Activity'}
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
