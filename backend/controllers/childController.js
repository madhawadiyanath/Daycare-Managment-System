const Child = require('../models/ChildModel');

// GET /children/:childId - fetch a child by staff-provided childId
const getChildByChildId = async (req, res) => {
  try {
    const { childId } = req.params;
    if (!childId || !String(childId).trim()) {
      return res.status(400).json({ success: false, message: 'childId is required' });
    }
    const child = await Child.findOne({ childId: String(childId).trim() }).populate('approvedBy', '-password');
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }
    return res.status(200).json({ success: true, data: child });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /children/:childId - update a child's editable fields by childId
const updateChildByChildId = async (req, res) => {
  try {
    const { childId } = req.params;
    if (!childId || !String(childId).trim()) {
      return res.status(400).json({ success: false, message: 'childId is required' });
    }
    const { name, age, gender, parent, healthNotes } = req.body;

    const child = await Child.findOne({ childId: String(childId).trim() });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    if (typeof name !== 'undefined') child.name = name;
    if (typeof age !== 'undefined') child.age = age;
    if (typeof gender !== 'undefined') child.gender = gender;
    if (typeof parent !== 'undefined') child.parent = parent;
    if (typeof healthNotes !== 'undefined') child.healthNotes = healthNotes;

    await child.save();
    const populated = await Child.findById(child._id).populate('approvedBy', '-password');
    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getChildByChildId, updateChildByChildId };
