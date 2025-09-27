const PendingChildRequest = require('../models/PendingChildRequestModel');
const Child = require('../models/ChildModel');

// Parent submits a child request
const submitChildRequest = async (req, res) => {
  try {
    const { name, age, gender, parent, healthNotes } = req.body;
    if (!name || !age || !gender || !parent) {
      return res.status(400).json({ success: false, message: 'Name, age, gender, and parent are required' });
    }
    const created = await PendingChildRequest.create({ name, age, gender, parent, healthNotes: healthNotes || '' });
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Staff: list pending requests
const listPendingRequests = async (_req, res) => {
  try {
    const list = await PendingChildRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Staff: approve a request -> create Child and mark request approved
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, childId } = req.body;
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'staffId is required' });
    }
    if (!childId || !String(childId).trim()) {
      return res.status(400).json({ success: false, message: 'childId is required and must be non-empty' });
    }
    const request = await PendingChildRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending request not found' });
    }
    // ensure childId uniqueness
    const exists = await Child.findOne({ childId: String(childId).trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'childId already exists, please choose a different one' });
    }
    const child = await Child.create({
      childId: String(childId).trim(),
      name: request.name,
      age: request.age,
      gender: request.gender,
      parent: request.parent,
      healthNotes: request.healthNotes || '',
      approvedBy: staffId,
    });
    request.status = 'approved';
    await request.save();
    return res.status(200).json({ success: true, data: { child, requestId: request._id } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Staff: reject a request
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PendingChildRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending request not found' });
    }
    request.status = 'rejected';
    await request.save();
    return res.status(200).json({ success: true, message: 'Request rejected' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitChildRequest,
  listPendingRequests,
  approveRequest,
  rejectRequest,
};
