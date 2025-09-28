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

module.exports = {
  createLearningActivity,
  listLearningActivitiesByChild,
  getLearningActivityById,
};
