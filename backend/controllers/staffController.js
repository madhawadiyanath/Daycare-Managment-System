const Staff = require('../models/StaffModel');

// Create a staff member
const createStaff = async (req, res) => {
  try {
    const { name, email, phone, role, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, username, and password are required' });
    }

    const emailExists = await Staff.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'A staff member with this email already exists' });
    }

    const usernameExists = await Staff.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const staff = await Staff.create({ name, email: email.toLowerCase().trim(), phone, role, username, password });
    const { password: _pw, ...safe } = staff.toObject();
    return res.status(201).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Login a staff member
const loginStaff = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const staff = await Staff.findOne({ username });
    if (!staff || staff.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid staff credentials' });
    }

    const { password: _pw, ...safe } = staff.toObject();
    return res.status(200).json({ success: true, staff: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all staff
const getStaff = async (_req, res) => {
  try {
    const list = await Staff.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a staff member
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update a staff member
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, username, password } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (email && email !== staff.email) {
      const emailExists = await Staff.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'A staff member with this email already exists' });
      }
    }

    if (username && username !== staff.username) {
      const usernameExists = await Staff.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    if (name !== undefined) staff.name = name;
    if (email !== undefined) staff.email = email;
    if (phone !== undefined) staff.phone = phone;
    if (role !== undefined) staff.role = role;
    if (username !== undefined) staff.username = username;
    if (password) staff.password = password; // update only if provided

    const saved = await staff.save();
    const { password: _pw, ...safe } = saved.toObject();
    return res.status(200).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createStaff,
  getStaff,
  deleteStaff,
  updateStaff,
  loginStaff,
};
