const FinanceManager = require('../models/FinanceManagerModel');

// Create a finance manager
const createFinanceManager = async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, username, and password are required' });
    }

    // Check duplicates
    const emailExists = await FinanceManager.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'A finance manager with this email already exists' });
    }

    const usernameExists = await FinanceManager.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const fm = await FinanceManager.create({ name, email, phone, username, password });
    // Omit password in response
    const { password: _pw, ...safe } = fm.toObject();
    return res.status(201).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all finance managers
const getFinanceManagers = async (_req, res) => {
  try {
    const list = await FinanceManager.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a finance manager
const deleteFinanceManager = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FinanceManager.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Finance manager not found' });
    }
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update a finance manager
const updateFinanceManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, username, password } = req.body;

    const fm = await FinanceManager.findById(id);
    if (!fm) {
      return res.status(404).json({ success: false, message: 'Finance manager not found' });
    }

    // duplicate checks (exclude current id)
    if (email && email !== fm.email) {
      const emailExists = await FinanceManager.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'A finance manager with this email already exists' });
      }
    }
    if (username && username !== fm.username) {
      const usernameExists = await FinanceManager.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    if (name !== undefined) fm.name = name;
    if (email !== undefined) fm.email = email;
    if (phone !== undefined) fm.phone = phone;
    if (username !== undefined) fm.username = username;
    if (password) fm.password = password; // only update if provided and non-empty

    const saved = await fm.save();
    const { password: _pw, ...safe } = saved.toObject();
    return res.status(200).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Login a finance manager
const loginFinanceManager = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const fm = await FinanceManager.findOne({ username });
    if (!fm || fm.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid finance manager credentials' });
    }

    const { password: _pw, ...safe } = fm.toObject();
    return res.status(200).json({ success: true, manager: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createFinanceManager,
  getFinanceManagers,
  deleteFinanceManager,
  updateFinanceManager,
  loginFinanceManager,
};
