const express = require('express');
const router = express.Router();
const { createTeacher, getTeachers, deleteTeacher, updateTeacher, loginTeacher } = require('../controllers/teacherController');

// Create
router.post('/', createTeacher);
// List
router.get('/', getTeachers);
// Delete
router.delete('/:id', deleteTeacher);
// Update
router.put('/:id', updateTeacher);
// Login
router.post('/login', loginTeacher);

module.exports = router;
