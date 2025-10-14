import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
import axios from 'axios';

function TeacherDashboard() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || 'null');
  const navigate = useNavigate();
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('teacher');
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  // Calculate date range: 7 days ago to today
  const getDateRange = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    return {
      min: sevenDaysAgo.toISOString().split('T')[0],
      max: today.toISOString().split('T')[0]
    };
  };
  
  const dateRange = getDateRange();
  
  // Combined form state for both activity and progress
  const [combinedForm, setCombinedForm] = useState({
    childId: 'C',
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
  const [touchedFields, setTouchedFields] = useState({
    childId: false,
    childName: false,
    date: false,
    title: false
  });
  
  // Function to handle child ID input - must start with C followed by numbers, C cannot be deleted
  const handleChildIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    
    // Prevent deletion of 'C'
    if (value.length === 0 || !value.startsWith('C')) {
      setCombinedForm({ ...combinedForm, childId: 'C' });
      setChildIdInvalid(false);
      return;
    }
    
    // Allow only C followed by numbers (e.g., C123)
    const childIdRegex = /^C\d*$/;
    
    if (childIdRegex.test(value)) {
      setCombinedForm({ ...combinedForm, childId: value });
      setChildIdInvalid(false);
    } else {
      setChildIdInvalid(true);
    }
  };
  
  // Mark field as touched
  const handleFieldBlur = (fieldName) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true });
  };
  
  // Handle progress metric changes (for both slider and input)
  const handleProgressChange = (field, value) => {
    // Ensure value is a number between 0 and 100
    let numValue = parseInt(value) || 0;
    numValue = Math.max(0, Math.min(100, numValue));
    setCombinedForm({ ...combinedForm, [field]: numValue });
  };
  
  // Function to handle child name input - only allow letters and spaces
  const handleChildNameChange = (e) => {
    const value = e.target.value;
    // Allow only letters (a-z, A-Z), spaces, and periods - NO quotes, apostrophes, or hyphens
    const lettersOnlyRegex = /^[a-zA-Z\s.]*$/;
    
    if (lettersOnlyRegex.test(value)) {
      setCombinedForm({ ...combinedForm, childName: value });
    }
  };
  
  // Function to handle Learning Activities child ID input - must start with C followed by numbers, C cannot be deleted
  const handleLaChildIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    
    // Prevent deletion of 'C'
    if (value.length === 0 || !value.startsWith('C')) {
      setLaChildId('C');
      setLaChildIdInvalid(false);
      return;
    }
    
    // Allow only C followed by numbers (e.g., C123)
    const childIdRegex = /^C\d*$/;
    
    if (childIdRegex.test(value)) {
      setLaChildId(value);
      setLaChildIdInvalid(false);
    } else {
      setLaChildIdInvalid(true);
    }
  };
  
  // Learning activities list state
  const [laChildId, setLaChildId] = useState('C');
  const [laChildIdInvalid, setLaChildIdInvalid] = useState(false);
  const [laList, setLaList] = useState([]);
  const [laLoadingList, setLaLoadingList] = useState(false);
  const [laListError, setLaListError] = useState('');
  
  // Search and filter state
  const [searchTitle, setSearchTitle] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'general', 'progress_update'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  // Update functionality state
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    notes: '',
    literacy: 0,
    mathematics: 0,
    socialSkills: 0,
    motorSkills: 0,
    creativity: 0
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // View functionality state
  const [viewActivity, setViewActivity] = useState(null);
  
  // Delete functionality state
  const [deleteActivity, setDeleteActivity] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState('record'); // 'record' or 'view'
  
  // Success popup notification state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Function to filter and sort activities
  const getFilteredAndSortedActivities = () => {
    let filtered = [...laList];

    // Apply search filter
    if (searchTitle.trim()) {
      filtered = filtered.filter(a => 
        a.title?.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.activityType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.date || a.createdAt || '';
        const dateB = b.date || b.createdAt || '';
        return sortOrder === 'asc' 
          ? dateA.localeCompare(dateB)
          : dateB.localeCompare(dateA);
      } else if (sortBy === 'title') {
        const titleA = a.title?.toLowerCase() || '';
        const titleB = b.title?.toLowerCase() || '';
        return sortOrder === 'asc'
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
      return 0;
    });

    return filtered;
  };

  return (
    <>
    <div className="t-dashboard">
      <div className="t-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="subtitle">Welcome{teacher ? `, ${teacher.name || teacher.username}` : ''}</p>
        </div>
        {teacher && (
          <div className="t-profile">
            <div className="teacher-info">
              <span className="username">{teacher.username}</span>
              <span className="email">{teacher.email}</span>
            </div>
            <Link to="/goHome" className="home-btn">
              🏠 Home
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      <div className="grid">

        {/* Tabbed Interface */}
        <div className="card full-width">
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'record' ? 'active' : ''}`}
              onClick={() => setActiveTab('record')}
            >
              <span className="tab-icon">✏️</span>
              Record Learning Activity
            </button>
            <button
              className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              <span className="tab-icon">📋</span>
              View Learning Activities
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Record Learning Activity Tab */}
            {activeTab === 'record' && (
              <div className="tab-panel">
                <h3 style={{ marginBottom: 8 }}>Record Learning Activity & Progress</h3>
                <p className="subtitle" style={{ marginTop: 0, marginBottom: 16 }}>Record learning activities and optionally track progress metrics in one form.</p>
                {formError && <div className="form-error">{formError}</div>}
                {formSuccess && <div className="form-success">{formSuccess}</div>}
                <form
            className="fm-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              setFormSuccess('');
              
              // Mark all fields as touched on submit
              setTouchedFields({
                childId: true,
                childName: true,
                date: true,
                title: true
              });
              
              const { childId, childName, title, date, description, activityType, literacy, mathematics, socialSkills, motorSkills, creativity, notes } = combinedForm;
              
              // Validation for Child ID
              if (!childId.trim() || childId.trim() === 'C') {
                setFormError('Child ID is required and must contain numbers after "C" (e.g., C123)');
                return;
              }
              
              // Validate Child ID format
              const childIdRegex = /^C\d+$/;
              if (!childIdRegex.test(childId.trim())) {
                setFormError('Child ID must be in format C followed by numbers (e.g., C123)');
                return;
              }
              
              // Validation for Child Name
              if (!childName.trim()) {
                setFormError('Child Name is required');
                return;
              }
              
              // Validation for Date
              if (!date) {
                setFormError('Date is required');
                return;
              }
              
              // Validation for Activity Title (only for general activities, progress updates auto-fill)
              if (activityType === 'general' && !title.trim()) {
                setFormError('Activity Title is required for General Learning Activities');
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
                
                // Reset form and touched fields
                setCombinedForm({
                  childId: 'C',
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
                setTouchedFields({
                  childId: false,
                  childName: false,
                  date: false,
                  title: false
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
                <label>Child ID <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  value={combinedForm.childId}
                  onChange={handleChildIdChange}
                  onBlur={() => handleFieldBlur('childId')}
                  placeholder="Enter Child ID (e.g., C123)"
                  required
                  title="Child ID must start with C followed by numbers"
                  style={{
                    borderColor: (touchedFields.childId && (childIdInvalid || combinedForm.childId === 'C')) ? '#dc3545' : '#e2e8f0'
                  }}
                />
                {touchedFields.childId && combinedForm.childId === 'C' && (
                  <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Please enter numbers after C (e.g., C123)
                  </small>
                )}
              </div>
              <div className="col">
                <label>Child Name <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  value={combinedForm.childName}
                  onChange={handleChildNameChange}
                  onBlur={() => handleFieldBlur('childName')}
                  placeholder="Enter Child Name (letters only)"
                  required
                  title="Only letters, spaces, and periods are allowed"
                  style={{
                    borderColor: (touchedFields.childName && !combinedForm.childName.trim()) ? '#dc3545' : '#e2e8f0'
                  }}
                />
                {touchedFields.childName && !combinedForm.childName.trim() && (
                  <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Child Name is required
                  </small>
                )}
              </div>
              <div className="col">
                <label>Date <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="date"
                  value={combinedForm.date}
                  onChange={(e) => setCombinedForm({ ...combinedForm, date: e.target.value })}
                  onBlur={() => handleFieldBlur('date')}
                  min={dateRange.min}
                  max={dateRange.max}
                  required
                  title="Select a date within the last 7 days"
                  style={{
                    borderColor: (touchedFields.date && !combinedForm.date) ? '#dc3545' : '#e2e8f0'
                  }}
                />
                {touchedFields.date && !combinedForm.date && (
                  <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Date is required
                  </small>
                )}
              </div>
            </div>

            {/* Activity Type Selection */}
            <div className="row">
              <div className="col">
                <label>Record Type <span style={{ color: '#dc3545' }}>*</span></label>
                <select
                  value={combinedForm.activityType}
                  onChange={(e) => setCombinedForm({ ...combinedForm, activityType: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ced4da', width: '100%' }}
                  required
                >
                  <option value="general">General Learning Activity</option>
                  <option value="progress_update">Progress Update (with metrics)</option>
                </select>
              </div>
              <div className="col">
                <label>
                  Activity Title 
                  {combinedForm.activityType === 'general' ? 
                    <span style={{ color: '#dc3545' }}> *</span> : 
                    ' (auto-filled)'}
                </label>
                <input
                  type="text"
                  value={combinedForm.title}
                  onChange={(e) => setCombinedForm({ ...combinedForm, title: e.target.value })}
                  onBlur={() => handleFieldBlur('title')}
                  placeholder={combinedForm.activityType === 'general' ? "e.g., Shapes & Colors" : "Daily Progress Update"}
                  disabled={combinedForm.activityType === 'progress_update'}
                  required={combinedForm.activityType === 'general'}
                  style={{
                    borderColor: (touchedFields.title && combinedForm.activityType === 'general' && !combinedForm.title.trim()) ? '#dc3545' : '#e2e8f0'
                  }}
                />
                {touchedFields.title && combinedForm.activityType === 'general' && !combinedForm.title.trim() && (
                  <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Activity Title is required for General Learning Activities
                  </small>
                )}
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
                  <div className="progress-header">
                    <label>Literacy</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={combinedForm.literacy}
                      onChange={(e) => handleProgressChange('literacy', e.target.value)}
                      className="progress-input"
                      placeholder="0"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.literacy}
                    onChange={(e) => handleProgressChange('literacy', e.target.value)}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <div className="progress-header">
                    <label>Mathematics</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={combinedForm.mathematics}
                      onChange={(e) => handleProgressChange('mathematics', e.target.value)}
                      className="progress-input"
                      placeholder="0"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.mathematics}
                    onChange={(e) => handleProgressChange('mathematics', e.target.value)}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <div className="progress-header">
                    <label>Social Skills</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={combinedForm.socialSkills}
                      onChange={(e) => handleProgressChange('socialSkills', e.target.value)}
                      className="progress-input"
                      placeholder="0"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.socialSkills}
                    onChange={(e) => handleProgressChange('socialSkills', e.target.value)}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <div className="progress-header">
                    <label>Motor Skills</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={combinedForm.motorSkills}
                      onChange={(e) => handleProgressChange('motorSkills', e.target.value)}
                      className="progress-input"
                      placeholder="0"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.motorSkills}
                    onChange={(e) => handleProgressChange('motorSkills', e.target.value)}
                    className="progress-slider"
                  />
                </div>
                
                <div className="progress-item">
                  <div className="progress-header">
                    <label>Creativity</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={combinedForm.creativity}
                      onChange={(e) => handleProgressChange('creativity', e.target.value)}
                      className="progress-input"
                      placeholder="0"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={combinedForm.creativity}
                    onChange={(e) => handleProgressChange('creativity', e.target.value)}
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
            )}

            {/* View Learning Activities Tab */}
            {activeTab === 'view' && (
              <div className="tab-panel">
                <h3 style={{ marginBottom: 16 }}>View Learning Activities</h3>
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
                // Reset search and filters when fetching new data
                setSearchTitle('');
                setFilterType('all');
                setSortBy('date');
                setSortOrder('desc');
                
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
          
          {/* Search and Filter Section - Only show after activities are loaded */}
          {laList.length > 0 && (
            <div style={{ 
              marginTop: 16, 
              padding: '16px', 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
              borderRadius: '12px',
              display: 'grid',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search by Title */}
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
                    🔍 Search by Title
                  </label>
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                {/* Filter by Type */}
                <div style={{ flex: '0 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
                    📋 Activity Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="general">📝 General Activity</option>
                    <option value="progress_update">📊 Progress Update</option>
                  </select>
                </div>
                
                {/* Sort By */}
                <div style={{ flex: '0 1 150px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
                    🔄 Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                
                {/* Sort Order */}
                <div style={{ flex: '0 1 150px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
                    ↕️ Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
              
              {/* Results count */}
              <div style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
                Showing {getFilteredAndSortedActivities().length} of {laList.length} activities
              </div>
            </div>
          )}
          
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Recorded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {laList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      {laLoadingList ? 'Loading...' : 'No activities to show'}
                    </td>
                  </tr>
                ) : getFilteredAndSortedActivities().length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                      No activities match your search/filter criteria
                    </td>
                  </tr>
                ) : (
                  getFilteredAndSortedActivities().map((a) => (
                    <tr key={a._id}>
                      <td>{a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-')}</td>
                      <td>{a.title || '-'}</td>
                      <td>{a.description || '-'}</td>
                      <td>{a.recordedBy || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button
                            className="btn"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                              color: '#fff',
                              border: 'none'
                            }}
                            onClick={() => setViewActivity(a)}
                          >
                            👁️ View
                          </button>
                          <button
                            className="btn"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              background: '#ffc107', 
                              color: '#000',
                              border: 'none'
                            }}
                            onClick={() => {
                              setSelectedActivity(a);
                              const formData = {
                                title: a.title || '',
                                description: a.description || '',
                                notes: a.notes || '',
                                literacy: a.progressMetrics?.literacy || 0,
                                mathematics: a.progressMetrics?.mathematics || 0,
                                socialSkills: a.progressMetrics?.socialSkills || 0,
                                motorSkills: a.progressMetrics?.motorSkills || 0,
                                creativity: a.progressMetrics?.creativity || 0
                              };
                              setUpdateForm(formData);
                              setUpdateError('');
                              setUpdateSuccess('');
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              background: '#dc3545', 
                              color: '#fff',
                              border: 'none'
                            }}
                            onClick={() => {
                              setDeleteActivity(a);
                              setDeleteError('');
                              setDeleteSuccess('');
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* View Activity Modal */}
          {viewActivity && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
              overflowY: 'auto'
            }}>
              <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                animation: 'slideIn 0.3s ease-out',
                position: 'relative',
                margin: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Activity Details
                  </h3>
                  <button
                    onClick={() => setViewActivity(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#999',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Basic Information */}
                  <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>📋 Basic Information</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Child ID</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px' }}>{viewActivity.childId || 'N/A'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Child Name</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px' }}>{viewActivity.childName || 'N/A'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Date</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px' }}>
                          {viewActivity.date || (viewActivity.createdAt ? new Date(viewActivity.createdAt).toLocaleDateString() : 'N/A')}
                        </p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Recorded By</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px' }}>{viewActivity.recordedBy || 'N/A'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Record Type</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px' }}>
                          {viewActivity.activityType === 'progress_update' ? '📊 Progress Update' : '📝 General Learning Activity'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>✏️ Activity Details</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Title</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px' }}>{viewActivity.title || 'N/A'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Description</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px', lineHeight: '1.6' }}>{viewActivity.description || 'N/A'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, color: '#666', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Notes / Observations</label>
                        <p style={{ margin: 0, color: '#2d3748', fontSize: '15px', lineHeight: '1.6' }}>{viewActivity.notes || 'No notes added'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Metrics - Only show if activityType is progress_update */}
                  {viewActivity.activityType === 'progress_update' && viewActivity.progressMetrics && (
                    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '16px', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>📊 Progress Metrics</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {[
                          { label: 'Literacy', value: viewActivity.progressMetrics.literacy },
                          { label: 'Mathematics', value: viewActivity.progressMetrics.mathematics },
                          { label: 'Social Skills', value: viewActivity.progressMetrics.socialSkills },
                          { label: 'Motor Skills', value: viewActivity.progressMetrics.motorSkills },
                          { label: 'Creativity', value: viewActivity.progressMetrics.creativity }
                        ].map((metric, idx) => (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600, color: '#666', fontSize: '13px' }}>{metric.label}</span>
                              <span style={{ fontWeight: 700, color: '#667eea', fontSize: '14px' }}>{metric.value}%</span>
                            </div>
                            <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                height: '100%', 
                                width: `${metric.value}%`,
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setViewActivity(null)}
                    className="btn"
                    style={{ padding: '10px 24px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Update Form Modal */}
          {selectedActivity && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
              overflowY: 'auto'
            }}>
              <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                animation: 'slideIn 0.3s ease-out',
                position: 'relative',
                margin: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ✏️ Edit Learning Activity
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      setUpdateError('');
                      setUpdateSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#999',
                      lineHeight: 1
                    }}
                    disabled={updateLoading}
                  >
                    ×
                  </button>
                </div>

                {/* Non-editable Info Card */}
                <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '14px', fontWeight: 700 }}>📋 Record Information (Non-editable)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontWeight: 600, color: '#666', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Child ID</label>
                      <p style={{ margin: 0, color: '#2d3748', fontSize: '14px' }}>{selectedActivity.childId || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#666', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Child Name</label>
                      <p style={{ margin: 0, color: '#2d3748', fontSize: '14px' }}>{selectedActivity.childName || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#666', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Date</label>
                      <p style={{ margin: 0, color: '#2d3748', fontSize: '14px' }}>
                        {selectedActivity.date || (selectedActivity.createdAt ? new Date(selectedActivity.createdAt).toLocaleDateString() : 'N/A')}
                      </p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#666', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Recorded By</label>
                      <p style={{ margin: 0, color: '#2d3748', fontSize: '14px' }}>{selectedActivity.recordedBy || 'N/A'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontWeight: 600, color: '#666', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Record Type</label>
                      <p style={{ margin: 0, color: '#2d3748', fontSize: '14px', fontWeight: 600 }}>
                        {selectedActivity.activityType === 'progress_update' ? '📊 Progress Update' : '📝 General Learning Activity'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {updateError && <div className="form-error" style={{ marginBottom: '16px' }}>{updateError}</div>}
                {updateSuccess && <div className="form-success" style={{ marginBottom: '16px' }}>{updateSuccess}</div>}
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdateError('');
                  setUpdateSuccess('');
                  
                  try {
                    setUpdateLoading(true);
                    
                    const updatePayload = {
                      title: updateForm.title.trim(),
                      description: updateForm.description.trim(),
                      notes: updateForm.notes.trim()
                    };

                    // Add progress metrics if this is a progress update
                    if (selectedActivity.activityType === 'progress_update') {
                      updatePayload.activityType = 'progress_update';
                      updatePayload.progressMetrics = {
                        literacy: parseInt(updateForm.literacy) || 0,
                        mathematics: parseInt(updateForm.mathematics) || 0,
                        socialSkills: parseInt(updateForm.socialSkills) || 0,
                        motorSkills: parseInt(updateForm.motorSkills) || 0,
                        creativity: parseInt(updateForm.creativity) || 0
                      };
                    }

                    const response = await axios.put(`http://localhost:5000/learning-activities/${selectedActivity._id}`, updatePayload);
                    
                    if (response.data?.success) {
                      // Refresh the activities list first
                      const res = await axios.get(`http://localhost:5000/learning-activities/by-child/${encodeURIComponent(laChildId)}`);
                      if (res.data?.success) {
                        setLaList(res.data.data || []);
                        
                        // If user is viewing this activity, update the view with fresh data from the response
                        if (viewActivity && viewActivity._id === selectedActivity._id) {
                          const updatedActivity = res.data.data.find(a => a._id === selectedActivity._id);
                          if (updatedActivity) {
                            // Update viewActivity with the fresh data from server
                            setViewActivity(updatedActivity);
                          }
                        }
                      }
                      
                      // Close the edit modal
                      setSelectedActivity(null);
                      setUpdateSuccess('');
                      setUpdateError('');
                      
                      // Show success popup
                      setShowSuccessPopup(true);
                      
                      // Hide success popup after 2 seconds
                      setTimeout(() => {
                        setShowSuccessPopup(false);
                      }, 2000);
                    }
                  } catch (err) {
                    setUpdateError(err?.response?.data?.message || 'Failed to update activity');
                  } finally {
                    setUpdateLoading(false);
                  }
                }}>
                  
                  {/* Editable Fields Section */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2d3748', fontSize: '14px' }}>
                      Title <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={updateForm.title}
                      onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '10px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2d3748', fontSize: '14px' }}>
                      Description <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <textarea
                      rows="4"
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '10px',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    />
                  </div>

                  {/* Progress Metrics - Only show for progress_update type */}
                  {selectedActivity.activityType === 'progress_update' && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
                      padding: '20px', 
                      borderRadius: '12px', 
                      marginBottom: '20px' 
                    }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: '15px', fontWeight: 700 }}>
                        📊 Update Progress Metrics (0-100%)
                      </h4>
                      
                      {[
                        { label: 'Literacy', field: 'literacy' },
                        { label: 'Mathematics', field: 'mathematics' },
                        { label: 'Social Skills', field: 'socialSkills' },
                        { label: 'Motor Skills', field: 'motorSkills' },
                        { label: 'Creativity', field: 'creativity' }
                      ].map((metric, idx) => (
                        <div key={idx} style={{ marginBottom: idx < 4 ? '16px' : '0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontWeight: 600, color: '#2d3748', fontSize: '13px' }}>{metric.label}</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={updateForm[metric.field]}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                val = Math.max(0, Math.min(100, val));
                                setUpdateForm({ ...updateForm, [metric.field]: val });
                              }}
                              style={{
                                width: '70px',
                                padding: '8px 12px',
                                border: '2px solid #667eea',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#764ba2'}
                              onBlur={(e) => e.target.style.borderColor = '#667eea'}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={updateForm[metric.field]}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setUpdateForm({ ...updateForm, [metric.field]: val });
                              }}
                              style={{
                                flex: 1,
                                height: '8px',
                                borderRadius: '4px',
                                background: `linear-gradient(to right, #667eea 0%, #764ba2 ${updateForm[metric.field]}%, #e2e8f0 ${updateForm[metric.field]}%, #e2e8f0 100%)`,
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            />
                            <span style={{ 
                              minWidth: '45px', 
                              fontWeight: 700, 
                              color: '#667eea', 
                              fontSize: '14px',
                              textAlign: 'right'
                            }}>
                              {updateForm[metric.field]}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2d3748', fontSize: '14px' }}>
                      Notes / Observations
                    </label>
                    <textarea
                      rows="3"
                      value={updateForm.notes}
                      onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '10px',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      placeholder="Optional notes..."
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActivity(null);
                        setUpdateError('');
                        setUpdateSuccess('');
                      }}
                      style={{
                        padding: '12px 28px',
                        border: '2px solid #e2e8f0',
                        background: 'white',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#cbd5e0';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      disabled={updateLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      {updateLoading ? '⏳ Updating...' : '✓ Update Activity'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {deleteActivity && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
              overflowY: 'auto'
            }}>
              <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '480px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                animation: 'slideIn 0.3s ease-out',
                position: 'relative',
                margin: 'auto'
              }}>
                <h3 style={{ color: '#dc3545', marginBottom: '16px', fontSize: '20px' }}>🗑️ Delete Learning Activity</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                  Are you sure you want to delete this activity? This action cannot be undone.
                </p>
                <div style={{ 
                  background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  marginBottom: '20px',
                  border: '2px solid #fc8181'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Child ID:</strong> {deleteActivity.childId}</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Title:</strong> {deleteActivity.title || 'N/A'}</p>
                  <p style={{ margin: '0', fontSize: '14px' }}><strong>Date:</strong> {deleteActivity.date || (deleteActivity.createdAt ? new Date(deleteActivity.createdAt).toLocaleDateString() : 'N/A')}</p>
                </div>
                
                {deleteError && <div className="form-error">{deleteError}</div>}
                {deleteSuccess && <div className="form-success">{deleteSuccess}</div>}
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteActivity(null);
                      setDeleteError('');
                      setDeleteSuccess('');
                    }}
                    style={{
                      padding: '10px 24px',
                      border: '2px solid #e2e8f0',
                      background: 'white',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e0'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setDeleteError('');
                      setDeleteSuccess('');
                      
                      try {
                        setDeleteLoading(true);
                        const response = await axios.delete(`http://localhost:5000/learning-activities/${deleteActivity._id}`);
                        
                        if (response.data?.success) {
                          setDeleteSuccess('Activity deleted successfully!');
                          // Refresh the activities list
                          const res = await axios.get(`http://localhost:5000/learning-activities/by-child/${encodeURIComponent(laChildId)}`);
                          if (res.data?.success) {
                            setLaList(res.data.data || []);
                          }
                          // Close modal after 1.5 seconds
                          setTimeout(() => {
                            setDeleteActivity(null);
                            setDeleteSuccess('');
                          }, 1500);
                        }
                      } catch (err) {
                        setDeleteError(err?.response?.data?.message || 'Failed to delete activity');
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                    style={{
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                    }}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : '🗑️ Delete Activity'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
    {/* Success Popup Notification */}
    {showSuccessPopup && (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideInRight 0.3s ease-out',
        fontSize: '15px',
        fontWeight: 600
      }}>
        <span style={{ fontSize: '20px' }}>✓</span>
        <span>Activity updated successfully!</span>
      </div>
    )}
    </>
  );
}

export default TeacherDashboard;
