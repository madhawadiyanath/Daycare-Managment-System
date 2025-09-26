const express = require('express');
const router = express.Router();
const { adminLogin, getDashboardData } = require('../controllers/adminController');

// Admin login route
router.post('/login', adminLogin);

// Admin dashboard route (protected in a real app with JWT)
router.get('/dashboard', getDashboardData);

module.exports = router;
