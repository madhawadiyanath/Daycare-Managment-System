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
  const [childIdInvalid, setChildIdInvalid] = useState(false);
  
  // Function to handle child ID input - must start with C or c followed by numbers
  const handleChildIdChange = (e) => {
    const value = e.target.value;
    // Allow Child ID to start with C or c followed by numbers (e.g., C123, c456)
    const childIdRegex = /^[Cc]\d*$/;
    
    if (value === '' || childIdRegex.test(value)) {
      setCombinedForm({ ...combinedForm, childId: value });
      setChildIdInvalid(false); // Reset invalid state when valid input
    } else {
      setChildIdInvalid(true); // Set invalid state when wrong format is attempted
    }
  };
  
  // Function to handle child name input - only allow letters and spaces
  const handleChildNameChange = (e) => {
    const value = e.target.value;
    // Allow only letters (a-z, A-Z), spaces, and common name characters like hyphens and apostrophes
    const lettersOnlyRegex = /^[a-zA-Z\s'-]*$/;
    
    if (lettersOnlyRegex.test(value)) {
      setCombinedForm({ ...combinedForm, childName: value });
    }
  };
  
  // Function to handle Learning Activities child ID input - must start with C or c followed by numbers
  const handleLaChildIdChange = (e) => {
    const value = e.target.value;
    // Allow Child ID to start with C or c followed by numbers (e.g., C123, c456)
    const childIdRegex = /^[Cc]\d*$/;
    
    if (value === '' || childIdRegex.test(value)) {
      setLaChildId(value);
      setLaChildIdInvalid(false); // Reset invalid state when valid input
    } else {
      setLaChildIdInvalid(true); // Set invalid state when wrong format is attempted
    }
  };
  
  // Learning activities list state
  const [laChildId, setLaChildId] = useState('');
  const [laChildIdInvalid, setLaChildIdInvalid] = useState(false);
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
                  onChange={handleChildIdChange}
                  placeholder="Enter Child ID (e.g., C123)"
                  required
                  title="Child ID must start with C or c followed by numbers"
                  style={{
                    borderColor: childIdInvalid ? '#dc3545' : '#ced4da'
                  }}
                />
              </div>
              <div className="col">
                <label>Child Name</label>
                <input
                  type="text"
                  value={combinedForm.childName}
                  onChange={handleChildNameChange}
                  placeholder="Enter Child Name (letters only)"
                  required
                  title="Only letters, spaces, hyphens, and apostrophes are allowed"
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

        {/* View Learning Activities by Child ID */}
        <div className="card full-width">
          <h3>View Learning Activities</h3>
          <div className="actions" style={{ gap: 8 }}>
            <input
              type="text"
              placeholder="Enter Child ID (e.g., C123)"
              value={laChildId}
              onChange={handleLaChildIdChange}
              title="Child ID must start with C or c followed by numbers"
              style={{ 
                padding: '10px', 
                borderRadius: 8, 
                border: `1px solid ${laChildIdInvalid ? '#dc3545' : '#ddd'}`, 
                flex: 1, 
                minWidth: 220 
              }}
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
