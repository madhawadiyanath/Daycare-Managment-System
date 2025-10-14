const LearningActivity = require('../models/LearningActivity');

// POST /learning-activities
async function createLearningActivity(req, res) {
  try {
    const { childId, childName, title, date, description, recordedBy } = req.body;

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
    };

    const created = await LearningActivity.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Create learning activity error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating learning activity' });
  }
}

// GET /learning-activities/by-child/:childId
async function listLearningActivitiesByChild(req, res) {
  try {
    const { childId } = req.params;
    const list = await LearningActivity.find({ childId: String(childId) }).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('List learning activities error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching learning activities' });
  }
}

// GET /learning-activities/:id
async function getLearningActivityById(req, res) {
  try {
    const act = await LearningActivity.findById(req.params.id);
    if (!act) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: act });
  } catch (err) {
    console.error('Get learning activity error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching record' });
  }
}

// PUT /learning-activities/:id
async function updateLearningActivity(req, res) {
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
    return res.status(500).json({ 
      success: false, 
      message: 'Server error updating learning activity' 
    });
  }
}

// DELETE /learning-activities/:id
async function deleteLearningActivity(req, res) {
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
}

module.exports = {
  createLearningActivity,
  listLearningActivitiesByChild,
  getLearningActivityById,
  updateLearningActivity,
  deleteLearningActivity,
};
