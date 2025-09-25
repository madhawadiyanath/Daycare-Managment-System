const Teacher = require('../models/TeacherModel');

// Create a teacher
const createTeacher = async (req, res) => {
  try {
    const { name, email, phone, subject, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, username, and password are required' });
    }

    const emailExists = await Teacher.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'A teacher with this email already exists' });
    }

    const usernameExists = await Teacher.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const teacher = await Teacher.create({ name, email: email.toLowerCase().trim(), phone, subject, username, password });
    const { password: _pw, ...safe } = teacher.toObject();
    return res.status(201).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Login a teacher
const loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const teacher = await Teacher.findOne({ username });
    if (!teacher || teacher.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid teacher credentials' });
    }

    const { password: _pw, ...safe } = teacher.toObject();
    return res.status(200).json({ success: true, teacher: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all teachers
const getTeachers = async (_req, res) => {
  try {
    const list = await Teacher.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update a teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, subject, username, password } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (email && email !== teacher.email) {
      const emailExists = await Teacher.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'A teacher with this email already exists' });
      }
    }

    if (username && username !== teacher.username) {
      const usernameExists = await Teacher.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    if (name !== undefined) teacher.name = name;
    if (email !== undefined) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (subject !== undefined) teacher.subject = subject;
    if (username !== undefined) teacher.username = username;
    if (password) teacher.password = password;

    const saved = await teacher.save();
    const { password: _pw, ...safe } = saved.toObject();
    return res.status(200).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  deleteTeacher,
  updateTeacher,
  loginTeacher,
};
