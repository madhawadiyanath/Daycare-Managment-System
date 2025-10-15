import React, { useState, useEffect } from 'react';
import './WeeklyTimetable.css';

function WeeklyTimetable({ childData }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [timeSlots, setTimeSlots] = useState([
    { startTime: '7:00am', endTime: '9:00am', activity: '' },
    { startTime: '9:00am', endTime: '11:00am', activity: '' },
    { startTime: '11:00am', endTime: '12:00am', activity: '' },
    { startTime: '12:00pm', endTime: '2:00pm', activity: '' },
    { startTime: '2:00pm', endTime: '4:00pm', activity: '' },
    { startTime: '4:00pm', endTime: '6:00pm', activity: '' },
    { startTime: '6:00pm', endTime: '7:00pm', activity: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  // Load existing timetable when child or date changes
  useEffect(() => {
    if (childData && selectedDate) {
      loadTimetableForDate();
    }
  }, [childData, selectedDate]);

  const loadTimetableForDate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/timetables/child/${childData.childId}/date?date=${selectedDate}`
      );
      const data = await response.json();

      if (data.success) {
        // Load existing timetable data
        if (data.data.timeSlots && data.data.timeSlots.length > 0) {
          const loadedSlots = data.data.timeSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            activity: slot.activity
          }));
          
          // Fill any missing slots with defaults
          while (loadedSlots.length < 7) {
            const defaultSlots = [
              { startTime: '7:00am', endTime: '9:00am', activity: '' },
              { startTime: '9:00am', endTime: '11:00am', activity: '' },
              { startTime: '11:00am', endTime: '12:00am', activity: '' },
              { startTime: '12:00pm', endTime: '2:00pm', activity: '' },
              { startTime: '2:00pm', endTime: '4:00pm', activity: '' },
              { startTime: '4:00pm', endTime: '6:00pm', activity: '' },
              { startTime: '6:00pm', endTime: '7:00pm', activity: '' }
            ];
            if (loadedSlots.length < defaultSlots.length) {
              loadedSlots.push(defaultSlots[loadedSlots.length]);
            }
          }
          
          setTimeSlots(loadedSlots);
        }
      } else {
        // Reset to default empty activities if no data found
        setTimeSlots([
          { startTime: '7:00am', endTime: '9:00am', activity: '' },
          { startTime: '9:00am', endTime: '11:00am', activity: '' },
          { startTime: '11:00am', endTime: '12:00am', activity: '' },
          { startTime: '12:00pm', endTime: '2:00pm', activity: '' },
          { startTime: '2:00pm', endTime: '4:00pm', activity: '' },
          { startTime: '4:00pm', endTime: '6:00pm', activity: '' },
          { startTime: '6:00pm', endTime: '7:00pm', activity: '' }
        ]);
      }
    } catch (err) {
      console.log('No existing timetable found for this date');
      // Reset to default values on error
      setTimeSlots([
        { startTime: '7:00am', endTime: '9:00am', activity: '' },
        { startTime: '9:00am', endTime: '11:00am', activity: '' },
        { startTime: '11:00am', endTime: '12:00am', activity: '' },
        { startTime: '12:00pm', endTime: '2:00pm', activity: '' },
        { startTime: '2:00pm', endTime: '4:00pm', activity: '' },
        { startTime: '4:00pm', endTime: '6:00pm', activity: '' },
        { startTime: '6:00pm', endTime: '7:00pm', activity: '' }
      ]);
    }
  };

  const handleActivityChange = (index, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index].activity = value;
    setTimeSlots(updatedSlots);
  };

  const saveTimetable = async () => {
    if (!childData) {
      setError('Please search for a child first');
      return;
    }

    const teacher = JSON.parse(localStorage.getItem('teacher') || '{}');
    if (!teacher || !teacher._id) {
      setError('Teacher information not found. Please login again.');
      return;
    }

    // Validate that at least one activity is filled
    const hasActivity = timeSlots.some(slot => slot.activity && slot.activity.trim());
    if (!hasActivity) {
      setError('Please add at least one activity to the timetable');
      return;
    }

    setLoading(true);
    setError('');
    setSaveMessage('');

    try {
      const timetablePayload = {
        childId: childData.childId,
        date: selectedDate,
        timeSlots: timeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          activity: slot.activity.trim() || 'Free Time'
        })),
        teacherId: teacher._id
      };

      const response = await fetch('http://localhost:5000/timetables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timetablePayload)
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage(data.message || 'Timetable saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to save timetable');
      }
    } catch (err) {
      setError('Error saving timetable. Please try again.');
      console.error('Save timetable error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!childData) {
    return (
      <div className="weekly-timetable">
        <div className="timetable-card">
          <h3>Weekly Time Table</h3>
          <p className="no-child-message">Please search for a child first to create their weekly timetable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-timetable">
      <div className="timetable-card">
        <h3>Weekly Time Table</h3>
        
        {/* Child Info */}
        <div className="child-info">
          <h4>{childData.name} (ID: {childData.childId})</h4>
        </div>

        {/* Date Selector */}
        <div className="date-section">
          <div className="date-selector">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="time-slots-section">
          {timeSlots.map((slot, index) => (
            <div key={index} className="time-slot-row">
              <div className="time-range">
                {slot.startTime} - {slot.endTime}
              </div>
              <input
                type="text"
                placeholder="Add Text"
                value={slot.activity}
                onChange={(e) => handleActivityChange(index, e.target.value)}
                className="activity-input"
              />
            </div>
          ))}
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {saveMessage && <div className="success-message">{saveMessage}</div>}

        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={saveTimetable}
            disabled={loading}
            className="save-button"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WeeklyTimetable;