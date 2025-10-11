const express = require('express');
const router = express.Router();
const LearningActivity = require('../models/LearningActivity');

// POST /learning-activities
router.post('/', async (req, res) => {
  try {
    const { childId, childName, title, date, description, recordedBy, progressMetrics, notes, activityType } = req.body;

    if (!childId || !childName) {
      return res.status(400).json({ success: false, message: 'childId and childName are required' });
    }

    const payload = {
      childId: String(childId).trim(),
      childName: String(childName).trim(),
      title: title ? String(title).trim() : undefined,
      date: date || new Date().toISOString().slice(0, 10),
      description: description ? String(description).trim() : undefined,
      recordedBy: recordedBy ? String(recordedBy).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      activityType: activityType || 'general'
    };

    // Add progress metrics if provided
    if (progressMetrics && activityType === 'progress_update') {
      payload.progressMetrics = {
        literacy: Math.min(Math.max(0, progressMetrics.literacy || 0), 100),
        mathematics: Math.min(Math.max(0, progressMetrics.mathematics || 0), 100),
        socialSkills: Math.min(Math.max(0, progressMetrics.socialSkills || 0), 100),
        motorSkills: Math.min(Math.max(0, progressMetrics.motorSkills || 0), 100),
        creativity: Math.min(Math.max(0, progressMetrics.creativity || 0), 100)
      };
    }

    const created = await LearningActivity.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Create learning activity error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating learning activity' });
  }
});

// GET /learning-activities/by-child/:childId
router.get('/by-child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { view, startDate, endDate } = req.query;
    
    let query = { childId: String(childId) };
    
    // Add date filtering for daily/weekly views
    if (view === 'daily' && startDate) {
      query.date = startDate;
    } else if (view === 'weekly' && startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const list = await LearningActivity.find(query).sort({ date: -1, createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('List learning activities error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching learning activities' });
  }
});

// GET /learning-activities/progress/:childId - Get latest progress metrics
router.get('/progress/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Get the most recent progress update
    const latestProgress = await LearningActivity.findOne({ 
      childId: String(childId), 
      activityType: 'progress_update',
      progressMetrics: { $exists: true }
    }).sort({ date: -1, createdAt: -1 });
    
    if (!latestProgress) {
      return res.json({ 
        success: true, 
        data: {
          progressMetrics: {
            literacy: 0,
            mathematics: 0,
            socialSkills: 0,
            motorSkills: 0,
            creativity: 0
          },
          lastUpdated: null
        }
      });
    }
    
    return res.json({ 
      success: true, 
      data: {
        progressMetrics: latestProgress.progressMetrics,
        lastUpdated: latestProgress.date,
        notes: latestProgress.notes
      }
    });
  } catch (err) {
    console.error('Get progress error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching progress' });
  }
});

// GET /learning-activities/analytics/:childId - Get progress analytics
router.get('/analytics/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { period } = req.query; // 'week' or 'month'
    
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const activities = await LearningActivity.find({
      childId: String(childId),
      activityType: 'progress_update',
      date: { $gte: startDate.toISOString().slice(0, 10) }
    }).sort({ date: 1 });
    
    return res.json({ success: true, data: activities });
  } catch (err) {
    console.error('Get analytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
});

// Optional: GET /learning-activities/:id
router.get('/:id', async (req, res) => {
  try {
    const act = await LearningActivity.findById(req.params.id);
    if (!act) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: act });
  } catch (err) {
    console.error('Get learning activity error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching record' });
  }
});

// PUT /learning-activities/:id - Update learning activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, notes } = req.body;

    // Find the existing activity
    const existingActivity = await LearningActivity.findById(id);
    if (!existingActivity) {
      return res.status(404).json({ success: false, message: 'Learning activity not found' });
    }

    // Prepare update payload
    const updatePayload = {};
    if (title !== undefined) updatePayload.title = String(title).trim();
    if (description !== undefined) updatePayload.description = String(description).trim();
    if (notes !== undefined) updatePayload.notes = String(notes).trim();
    
    // Add update timestamp
    updatePayload.updatedAt = new Date();

    // Update the activity
    const updatedActivity = await LearningActivity.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );

    return res.json({ 
      success: true, 
      data: updatedActivity,
      message: 'Learning activity updated successfully'
    });
  } catch (err) {
    console.error('Update learning activity error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: ' + err.message 
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid activity ID format' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Server error updating learning activity' 
    });
  }
});

// DELETE /learning-activities/:id - Delete learning activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing activity
    const existingActivity = await LearningActivity.findById(id);
    if (!existingActivity) {
      return res.status(404).json({ success: false, message: 'Learning activity not found' });
    }

    // Delete the activity
    await LearningActivity.findByIdAndDelete(id);

    return res.json({ 
      success: true, 
      message: 'Learning activity deleted successfully',
      data: { id: existingActivity._id, childId: existingActivity.childId }
    });
  } catch (err) {
    console.error('Delete learning activity error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid activity ID format' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Server error deleting learning activity' 
    });
  }
});

module.exports = router;
